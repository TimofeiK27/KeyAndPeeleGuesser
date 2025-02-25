#!/bin/bash

# Check if yt-dlp is installed
if ! command -v yt-dlp &> /dev/null; then
    echo "yt-dlp is not installed. Please install it using 'brew install yt-dlp' or download it from https://github.com/yt-dlp/yt-dlp"
    exit 1
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "ffmpeg is not installed. Please install it using 'brew install ffmpeg' or download it from https://ffmpeg.org/download.html"
    exit 1
fi

# Prompt user for playlist URL
echo "Enter YouTube Playlist URL:"
read PLAYLIST_URL

# Extract Playlist ID
PLAYLIST_ID=$(echo "$PLAYLIST_URL" | grep -o "list=[^&]*" | cut -d= -f2)

if [ -z "$PLAYLIST_ID" ]; then
    echo "Invalid YouTube Playlist URL. Please ensure it contains 'list=PLAYLIST_ID'."
    exit 1
fi

# Output directory
OUTPUT_DIR="audio_downloads"

# Create the output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Output JSON file
METADATA_FILE="playlist_metadata.json"

# Start JSON array
echo "[" > "$METADATA_FILE"

# Download audio and generate metadata
yt-dlp -x --audio-format mp3 -o "$OUTPUT_DIR/%(title)s.%(ext)s" \
       --print-json "https://www.youtube.com/playlist?list=${PLAYLIST_ID}" | \
jq -c --arg OUTPUT_DIR "$OUTPUT_DIR" '
. | 
{
    original_title: .title,
    cleaned_title: (.title | gsub("Key & Peele"; "") | gsub("Uncensored"; "") | gsub("-";"") | gsub("^\\s+|\\s+$"; "") | gsub(" +"; " ")),
    file_path: ($OUTPUT_DIR + "/" + (.title + ".mp3")),
    video_url: .webpage_url
}' | jq -s '.' > "$METADATA_FILE"

# Close JSON array
sed -i '' -e '$ s/,$//' "$METADATA_FILE"


if [ $? -eq 0 ]; then
    echo "Audio files have been saved to the '$OUTPUT_DIR' directory with cleaned filenames."
    echo "Metadata has been saved to '$METADATA_FILE'."
else
    echo "An error occurred while downloading audio or generating metadata."
fi

# https://www.youtube.com/playlist?list=PLFrISy6R4Ll_B0bmrbnpw_4QLP-jsq0fH
# тест  https://www.youtube.com/playlist?list=PLtS2M5_w7l95ucbLexJ42uuPTS9J7F6ZM

echo '{"title": "Key & Peele - Some Title - Uncensored"}' | jq '.title | gsub("Key & Peele"; "") | gsub("Uncensored"; "") | gsub("-";"") | gsub("^\\s+|\\s+$"; "")'
