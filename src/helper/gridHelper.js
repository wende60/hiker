
const gridHelper = (tileSize, mapWidth, mapHeight) => {
    const initialGrid = (data, locationPxOffset) => {
        data.size = { x: tileSize, y: tileSize };
        data = createGridRows(data, Math.floor(mapHeight / tileSize));
        data = createGridColumns(data, Math.floor(mapWidth / tileSize));
        return calculateCenter(data, locationPxOffset);
    };

    const createGridRows = (data, rows) => {
        /* using ceil will result in one more loop for odd values to keep origin centered */
        const max = Math.ceil(rows / 2);
        for (let i = 0; i < max; i += 1) {
            data = addNorth(data);
            data = addSouth(data);
        }
        return data;
    };

    const createGridColumns = (data, cols) => {
        /* using ceil will result in one more loop for odd values to keep origin centered */
        const max = Math.ceil(cols / 2);
        for (let i = 0; i < max; i += 1) {
            data = addWest(data);
            data = addEast(data);
        }
        return data;
    };

    const addNorth = data => {
        data.grid.unshift(createRow(data.grid, true));
        data.size.y += tileSize;
        return data;
    };

    const addSouth = data => {
        data.grid.push(createRow(data.grid, false));
        data.size.y += tileSize;
        return data;
    };

    const addWest = data => {
        data.grid.forEach(row => row.unshift(createColumn(row, true)));
        data.size.x += tileSize;
        return data;
    };

    const addEast = data => {
        data.grid.forEach(row => row.push(createColumn(row, false)));
        data.size.x += tileSize;
        return data;
    };

    const remNorth = data => {
        data.grid.shift();
        data.size.y -= tileSize;
        return data;
    };

    const remSouth = data => {
        data.grid.pop();
        data.size.y -= tileSize;
        return data;
    };

    const remWest = data => {
        data.grid.forEach(row => row.shift());
        data.size.x -= tileSize;
        return data;
    };

    const remEast = data => {
        data.grid.forEach(row => row.pop());
        data.size.x -= tileSize;
        return data;
    };

    const createRow = (grid, isNorth) => {
        const northOrSouth = isNorth ? - 1 : 1;
        const rowIndex = isNorth ? 0 : grid.length - 1;
        const copyRow = grid[rowIndex].slice();
        return copyRow.map(data => {
            return { x: data.x, y: data.y + northOrSouth }
        });
    };

    /* add new column to grid object */
    const createColumn = (row, isWest) => {
        const westOrEast = isWest ? - 1 : 1;
        const columnIndex = isWest ? 0 : row.length - 1;
        return {...row[columnIndex], x: row[columnIndex].x + westOrEast};
    };

    const calculateCenter = (data, locationPxOffset) => {
        const centeredOffsetX = (data.size.x - mapWidth) / 2;
        const centeredOffsetY = (data.size.y - mapHeight) / 2;

        const correctX = locationPxOffset.pxX - tileSize / 2;
        const correctY = locationPxOffset.pxY - tileSize / 2;

        const offset = {
            x: (centeredOffsetX + correctX) * - 1,
            y: (centeredOffsetY + correctY) * - 1
        }

        const addData = addNewTiles(data, offset);
        return { data: addData.data, offset: addData.offset };
    };

    const addNewTiles = (data, offset) => {
        if (data.size.x + offset.x < mapWidth) {
            data = addEast(data);
        } else if (offset.x > 0) {
            data = addWest(data);
            offset.x -= tileSize;
        }

        if (data.size.y + offset.y < mapHeight) {
            data = addSouth(data);
        } else if (offset.y > 0) {
            data = addNorth(data);
            offset.y -= tileSize;
        }
        return { data, offset };
    };

    const getGridSize = data => {
        const gridWidth = data.grid.length ? data.grid[0].length * tileSize : 0;
        const gridHeight = data.grid.length ? data.grid.length * tileSize : 0;
        return {
            gridWidth,
            gridHeight
        };
    };

    const calculateNewCenter = (data, offset) => {
        const centerVertical = mapHeight / 2 + offset.y * - 1;
        const centerHorizontal = mapWidth / 2 + offset.x * - 1;
        const posVertical = centerVertical / tileSize;
        const posHorizontal = centerHorizontal / tileSize

        const centerRowIndex = Math.floor(posVertical);
        const centerTileIndex = Math.floor(posHorizontal);

        const centerXY = {
            ...data.grid[centerRowIndex][centerTileIndex],
            frX: fract(posHorizontal),
            frY: fract(posVertical),
            pxX: fract(posHorizontal) * tileSize,
            pxY: fract(posVertical) * tileSize
        };

        return centerXY;
    };

    const fract = val => val % 1;

    return {
        initialGrid,
        addNewTiles,
        calculateNewCenter
    };
};

export default gridHelper;
