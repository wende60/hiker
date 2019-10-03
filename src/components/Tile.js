import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text, Image, View, StyleSheet } from 'react-native';
import { createDirectory, downloadAndStore } from 'helper/fileSystemHelper.js';
import CONST from 'settings/mapConfig.js';

class Tile extends PureComponent {
    constructor(props) {
        super(props);
        this.runner = null;
        this.counter = 0;
        this.state = {
            tileSource: { uri: 'foo.gif' }
        };
    }

    componentDidMount() {
        this.mounted = true;
        this.getTile()
    }

    componentWillUnmount() {
        clearTimeout(this.runner);
        this.mounted = false;
    }

    getTile = async() => {
        const { tileX, tileY, zoom } = this.props;

        const tile = tileY + '.png';
        const path = zoom +  '/' + tileX + '/' + tile;
        const tileUrl = CONST.TILEURL + path + (CONST.APIKEY ? '?apikey=' + CONST.APIKEY : '');

        const localPath = CONST.TILEDIR + '/' + zoom + '/' + tileX;
        const localFile = localPath + '/' + tile;

        const isDir = await createDirectory(localPath);

        if (isDir) {
            const fileData = await downloadAndStore(tileUrl, localFile);
            if (fileData.exists) {
                this.mounted && this.setState({ tileSource: { uri: fileData.uri }});
            } else {
                this.repeatProcedure();
            }
        } else {
            this.repeatProcedure();
        }
    };

    repeatProcedure() {
        clearTimeout(this.runner);
        if (this.counter < 10) {
            this.counter += 1;
            this.runner = setTimeout(() => { this.getTile() }, 200);
        }
    }

    render() {
        return (
            <View style={styles.imgTileWrapper}>
                <Image style={styles.imgTile} source={this.state.tileSource} />
                <Text style={styles.info} >{`TILE: ${this.props.tileX}  ${this.props.tileY}`}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    imgTileWrapper: {
        width: 256,
        height: 256
    },
    imgTile: {
        width: 256,
        height: 256
    },
    info: {
        position: 'absolute',
        left: 0,
        top: 0,
        backgroundColor: 'white',
        padding: 5,
        opacity: 0.8,
    }
});

Tile.propTypes = {
    tileX: PropTypes.number.isRequired,
    tileY: PropTypes.number.isRequired,
    zoom: PropTypes.number.isRequired,
    location: PropTypes.object
};

export default Tile;

