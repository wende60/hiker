import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text, View, StyleSheet } from 'react-native';
import osmHelper from 'helper/osmHelper.js';
import CONST from 'settings/mapConfig.js';

class Overlay extends PureComponent {
    constructor(props) {
        super(props);
        this.state = { edge: { x: 0, y: 0 }};
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    getLocationMarker() {
        const locationXY = this.getLocationXY(this.props.location);
        const edge = this.props.gridData.grid[0][0];
        const size = this.props.gridData.size;

        const left = (locationXY.x - edge.x) * CONST.TILESIZE + locationXY.pxX;
        const top = (locationXY.y - edge.y) * CONST.TILESIZE + locationXY.pxY;

        if (left > size.x || top > size.y) {
            return null;
        }

        return (
            <View
                style={{
                    left,
                    top,
                    ...styles.locationMarker
                }} >
                <View style={styles.locationMarkerCore} />
            </View>
        );
    }

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

    render() {
        return (
            <View style={styles.OverlayWrapper}>
                {this.getLocationMarker()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    OverlayWrapper: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
    },
    locationMarker: {
        width: 40,
        height: 40,
        marginTop: -20,
        marginLeft: -20,
        borderRadius: 20,
        backgroundColor: 'blue',
        opacity: 0.3,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationMarkerCore: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'red',
    }
});

Overlay.propTypes = {
    gridData: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    zoom: PropTypes.number.isRequired,
};

export default Overlay;

