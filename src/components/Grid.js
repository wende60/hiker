import React, { PureComponent } from 'react';
import { Text, PanResponder, Animated, View, StyleSheet } from 'react-native';
import { FileSystem } from 'expo';
import osmHelper from 'helper/osmHelper.js';
import gridHelper from 'helper/gridHelper.js';
import Tiles from 'components/Tiles.js';
import Overlay from 'components/Overlay.js';
import CONST from 'settings/mapConfig.js';

const createArrayDeepClone = data => {
    return data.map(subarr => {
        return subarr.slice();
    }).slice();
}

class Grid extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            pan: new Animated.ValueXY(),
            gridData: null,
            size: null,
            url: null,
            center: null,
            displayInfo: false
        };

        this.gridCalculator = null;

        this._panResponder = PanResponder.create({
            onMoveShouldSetResponderCapture: () => true,
            onMoveShouldSetPanResponderCapture: () => true,

            // Initially, set the value of x and y to 0 (the center of the screen)
            onPanResponderGrant: (e, gestureState) => {
                // Set the initial value to the current state
                this.state.pan.setOffset({
                    x: this.state.pan.x._value,
                    y: this.state.pan.y._value
                });
                this.state.pan.setValue({ x: 0, y: 0 });
            },

            // When we drag/pan the object, set the delate to the states pan position
            onPanResponderMove: Animated.event([
                null,
                {
                    dx: this.state.pan.x,
                    dy: this.state.pan.y
                },
            ]),

            onPanResponderRelease: e => {
                // Flatten the offset to avoid erratic behavior
                this.state.pan.flattenOffset();
                this.resetGrid();
            }
        });
    }

    componentDidMount() {
        this.props.locationCallback(this.prepareGrid);
        this.state.pan.addListener(this.handlePanChange);
    }

    handlePanChange = value => {
        const { width, height } = this.state.size;
        const { gridData } = this.state;

        this.shiftPanX = value.x > 0;
        this.shiftPanY = value.y > 0;
        const outOfX = this.shiftPanX || gridData.size.x + value.x < width;
        const outOfY = this.shiftPanY || gridData.size.y + value.y < height;

        if (outOfX || outOfY) {
            const gridDeepCopy = createArrayDeepClone(gridData.grid);
            const dataClone = {
                grid: gridDeepCopy,
                size: { ...gridData.size }
            }

            const addData = this.gridCalculator.addNewTiles(dataClone, { ...value});
            this.setState({
                gridData: { ...addData.data }
            }, () => {
                this.shiftPanWhileDragging(addData.offset);
            });
        }
    };

    shiftPanWhileDragging(value) {
        /*
            north or west was add
            update pan while dragging
        */
        if (this.shiftPanX || this.shiftPanY) {
            const yVal = value.y - this.state.pan.y._value;
            const xVal = value.x - this.state.pan.x._value;

            this.shiftPanX = false;
            this.shiftPanY = false;

            this.state.pan.setOffset({
                x: xVal,
                y: yVal
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.size !== prevState.size) {
            const { width, height } = this.state.size;
            this.gridCalculator = gridHelper(CONST.TILESIZE, width, height);
            this.prepareGrid(this.props.location);
        }
        if (this.props.zoom !== prevProps.zoom) {
            this.handleZoomChange(prevProps.zoom);
        }
    }

    componentWillUnmount() {
        this.state.pan.removeAllListeners();
    }

    onLayoutHandler = e => {
        const { width, height } = e.nativeEvent.layout;
        this.setState({ size: {
            width,
            height
        }});
    };

    handleZoomChange(zoom) {
        this.prepareGrid({
            latitude: this.state.center.latitude,
            longitude: this.state.center.longitude
        });
    }

    calculateCurrentCenter = () => {
        const { gridData } = this.state;
        const currentOffset = {
            x: this.state.pan.x._value,
            y: this.state.pan.y._value
        };

        const locationXY = this.gridCalculator.calculateNewCenter(gridData, currentOffset);
        const { lat, lon } = osmHelper.xyToLatLon (
            locationXY.x + locationXY.frX,
            locationXY.y + locationXY.frY,
            this.props.zoom
        );

        return { ...locationXY, latitude: lat, longitude: lon };
    };

    getLocationXY(location) {
        const { latitude, longitude } = location;
        const { tileX, tileY } = osmHelper.latLonToXY(
            latitude,
            longitude,
            this.props.zoom
        );
        const locationPxOffset = osmHelper.getPixelOffset(
            latitude,
            longitude,
            this.props.zoom
        );
        return {
            x: tileX,
            y: tileY,
            ...locationPxOffset
        }
    }

    prepareGrid = location => {
        const locationXY = this.getLocationXY(location);
        this.createGrid({ ...locationXY, ...location });
    };

    resetGrid = () => {
        const center = this.calculateCurrentCenter();
        this.createGrid(center);
    };

    createGrid = ({ x, y, pxX, pxY, latitude, longitude }) => {
        const initialData = { grid: [[{ x, y }]] };
        const { data, offset } = this.gridCalculator.initialGrid(initialData, { pxX, pxY });

        this.setState({
            gridData: { ...data },
            center: { x, y, pxX, pxY, latitude, longitude }
        }, () => {
            this.state.pan.setOffset({ ...offset });
            this.state.pan.setValue({ x: 0, y: 0 });
            this.state.pan.flattenOffset();
        });
    }

    createDragableGridContent() {
        const { grid } = this.state.gridData;
        const contentStyle = {
            transform: [
                { translateX: this.state.pan.x },
                { translateY: this.state.pan.y }
            ]
        };
        const height = grid.length * CONST.TILESIZE;
        const width = grid[0].length * CONST.TILESIZE;

        return (
            <Animated.View
                style={{
                    width,
                    height,
                    ...contentStyle
                }}
            >
                <Tiles gridData={this.state.gridData} zoom={this.props.zoom} />
                <Overlay
                    gridData={this.state.gridData}
                    location={this.props.location}
                    zoom={this.props.zoom} />
            </Animated.View >
        );
    }

    render() {
        return (
            <View
                style={styles.gridWrapper}
                onLayout={this.onLayoutHandler}
                {...this._panResponder.panHandlers}>
                {this.state.gridData && this.createDragableGridContent()}
                <View style={styles.centerVertical}>
                    <View style={styles.centerHorizontal} />
                </View>
                {this.state.center &&
                    <Text style={styles.debug}>
                        {`lat: ${this.state.center.latitude}, lon: ${this.state.center.longitude}${'\n'}`}
                    </Text>
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    gridWrapper: {
        flex: 1,
        width: '100%'
    },
    info: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        backgroundColor: 'white',
        padding: 5,
        opacity: 0.5,
        borderRadius: 5
    },
    centerVertical: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        height: 40,
        width: 0,
        marginTop: -20,
        marginLeft: -1,
        borderLeftColor: 'black',
        borderLeftWidth: 2,
        overflow: 'visible',
    },
    centerHorizontal: {
        height: 0,
        width: 40,
        marginTop: 19,
        marginLeft: -21,
        borderTopColor: 'black',
        borderTopWidth: 2,
    },
    debug: {
        position: 'absolute',
        backgroundColor: 'white',
        padding: 5,
        opacity: 0.8,
        left: 0,
        bottom: 0,
        width: '100%',
    }
});

export default Grid;

