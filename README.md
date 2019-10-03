# hiker
Map app based on Expo and ReactNative

This is a (working) experiment. Expo does not provide someting like MapBox. However, the tiles should be cached in the file system, so the OSM js-api is no option. Therefore the tile grid eith all the calculations is a selfmade solution. Unfortunately the Expo file system handling is not very convincing...

Right now I am using the tiles from https://tile.thunderforest.com/outdoors/ An API key is needed and has to be added in settings/mapConfig.js For small tile usage you can get it for free. 
