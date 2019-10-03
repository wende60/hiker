import React, { PureComponent } from 'react';
import { Platform, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Constants, Location, Permissions } from 'expo';
import Grid from 'components/Grid.js';
import CONST from 'settings/mapConfig.js';

class Map extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            location: null,
            errorMessage: null,
            zoom: 14
        };

        this.goToLocation = () => {};
    }

    componentDidMount() {
        if (Platform.OS === 'android' && !Constants.isDevice) {
            this.setState({ errorMessage: 'Try it on your device!' });
        } else {
            this.getLocation();
        }
    }

    getLocation = async() => {
        const { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({ location: CONST.LATLON });
            return;
        }
        const location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
        this.setState({ location: location.coords });
    };

    pressZoomPlus = () => {
        const zoom = this.state.zoom < 18
            ? this.state.zoom + 1 : 18;
        this.setState({ zoom });
    }

    pressZoomMinus = () => {
        const zoom = this.state.zoom > 2
            ? this.state.zoom - 1 : 2;
        this.setState({ zoom });
    };

    locationCallback = callback => {
        this.goToLocation = callback;
    }

    pressGoToLocation = async() => {
        await this.getLocation();
        this.goToLocation(this.state.location);
    };

    getMapView() {
        return (
            <View style={styles.map} >
                <Grid
                    location={this.state.location}
                    zoom={this.state.zoom}
                    locationCallback={this.locationCallback} />
            </View>
        );
    }

    getMsgView() {
        let text = 'Waiting..';
        if (this.state.errorMessage) {
            text = this.state.errorMessage;
        }
        return (
            <View style={styles.msg}>
                <Text style={styles.paragraph}>{text}</Text>
            </View>
        );
    }

    render() {
        return (
            <View style={styles.mapWrapper}>
                <View style={styles.mapContent}>
                    {this.state.location ? this.getMapView() : this.getMsgView()}
                </View>

                <View style={styles.toolContent}>
                    <TouchableOpacity style={styles.zoomButton} onPress={this.pressZoomPlus}>
                        <Text style={styles.zoomButtonText}>+</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.zoomButton} onPress={this.pressZoomMinus}>
                        <Text style={styles.zoomButtonText}>-</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.locationButton} onPress={this.pressGoToLocation}>
                        <View style={styles.locationButtonCore} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mapWrapper: {
        flex: 1,
        flexDirection: 'column',
    },
    mapContent: {
        flex: 1,
        backgroundColor: 'white',
        flexBasis: '90%',
    },
    toolContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'grey',
        flexBasis: 50,
    },
    map: {
        flex: 1,
    },
    msg: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paragraph: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 5,
    },
    zoomButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ffffff',
        marginLeft: 10,
        marginRight: 10,
    },
    zoomButtonText: {
        fontSize: 36,
        lineHeight: 42,
    },
    locationButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'blue',
        marginLeft: 10,
        marginRight: 10,
        opacity: 0.5,
    },
    locationButtonCore: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'red',
    },
});

export default Map;

