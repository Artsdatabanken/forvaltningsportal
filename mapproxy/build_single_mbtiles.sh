#!/bin/bash -e
# Seeds the complete set of mbtiles for a single layer and renders missing overview zoom levels for the layer

DEST_PATH=/home/grunnkart/tilesdata/grunnkart
SOURCE_PATH=$1webmercator
if [ ! -d $SOURCE_PATH ]; then
  echo Using google
  SOURCE_PATH=$1google
fi
SOURCE_MBTILES=$(ls -Art $SOURCE_PATH/*.mbtile | tail -n 1) # There may be multiple files in cache - use newest

if [ -z ${SOURCE_MBTILES} ]; then 
  echo No .mbtile found in $SOURCE_PATH
  exit
fi

DATASET=$( basename $1 )
TARGET_MBTILES=$DEST_PATH/${DATASET##*/}.mbtiles        

if [[ $TARGET_MBTILES -nt $SOURCE_MBTILES ]]; 
then
  echo $DATASET Nothing new, moving on..
else
  echo Processing more recent cache file for $TARGET_MBTILES
  cp $SOURCE_MBTILES $TARGET_MBTILES
  ./build_single_mbtiles_overviews.sh "$TARGET_MBTILES"
fi


