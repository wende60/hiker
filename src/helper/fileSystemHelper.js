import { FileSystem } from 'expo';

export const createDirectory = async(dir) => {
    const metaInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + dir);
    const isDir = metaInfo.isDirectory;
    if (!isDir) {
        try {
            await FileSystem.makeDirectoryAsync(
                FileSystem.documentDirectory + dir,
                { intermediates: true }
            );
        } catch (e) {
            console.info("ERROR", e);
            return false;
        }
    }

    //const newMetaInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + dir);
    //console.info("DIRECTORY DONE", newMetaInfo)
    return true;
};

export const downloadAndStore = async(source, file) => {
    let metaData = await FileSystem.getInfoAsync(FileSystem.documentDirectory + file);
    const isFile = metaData.exists;
    if (!isFile) {
        try {
            await FileSystem.downloadAsync(
                source,
                FileSystem.documentDirectory + file
            );
            metaData = await FileSystem.getInfoAsync(FileSystem.documentDirectory + file);
        } catch (e) {
            console.info("ERROR", e);
            return false;
        }
    }
    return metaData;
}


export const deleteAllData = async() => {
    try {
        const dirs = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
        dirs.forEach(dir => {
            console.info("delete", dir);
            FileSystem.deleteAsync(FileSystem.documentDirectory + dir)
        });
    } catch (e) {
        console.info("ERROR", e);
        return false;
    }
    return dirs || [];
};

