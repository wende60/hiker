import React, { PureComponent, Fragment } from 'react';
import { View, StyleSheet } from 'react-native';
import Tile from 'components/Tile.js';

class Tiles extends PureComponent {
    createGridRow(row) {
        return row.map((tile, index) => {
            return (
                <View key={`${tile.x}-${tile.y}`} style={styles.tileWrapper}>
                    <Tile
                        tileX={tile.x}
                        tileY={tile.y}
                        zoom={this.props.zoom} />
                </View>
            );
        });
    }

    createGrid() {
        const { grid } = this.props.gridData;
        return grid.map(row => {
            const width = row.length * 256;
            const rowY = row[0].y;
            return (
                <View key={`row-${rowY}`} style={{ ...styles.tilesRow, width }}>
                    {this.createGridRow(row)}
                </View>
            );
        });
    }

    render() {
        return (
            <View style={styles.tilesWrapper}>
                {this.props.gridData.grid && this.createGrid()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    tilesWrapper: {

    },
    tilesRow: {
        height: 256,
        flexDirection: 'row'
    },
    tileWrapper: {
        flex: 1,
        width: 256,
        height: 256,
    }
});

export default Tiles;

