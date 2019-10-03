import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Constants } from 'expo';
import Map from 'components/Map.js';

const App = () => {
    return (
        <View style={styles.appWrapper}>
            <Map />
        </View>
    );
};

const styles = StyleSheet.create({
    appWrapper: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
    },
});

export default App;

