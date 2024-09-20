Step 1: live-streaming-app is working as camera(video) and mic (audio) 
Step 2: video and audio from application goes to OBS encoder to convert audio and video into a single format [video + audio]
Step 3: OBS encoder will send the single format to server (RTMP and HLP) 
Step 4: Server (RTMP and HLP) will distribute the single format URL to different clients (our application users)


#OBS -> Nginx Server -> NodeJS server (live-streaming-app)

Step1:OBS software working as camera(video) and mic (audio)
Step2:.ts and m3u8 file are generated and stored in /var/www/hls directory in nginx server
Step3: m3u8 file is rendered in web application with help of video js that serve m3u8 file

#OBS setting
OBS -> File -> Setting -> Stream -> 
Server = rtmp://localhost/live
Stream key = anything unique (here stream)

#Nginx Congfig

worker_processes auto;
pid /run/nginx.pid;

include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 768;
    # multi_accept on;
}


http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;  # HTTP port for serving the HLS stream

        # Serve the HLS stream
        location /hls {
            types {
                application/vnd.apple.mpegurl m3u8;
                video/mp2t ts;
            }
            root /var/www/;  # The root directory for the HLS files (/var/www/hls/)

            # Enable CORS for requests from your app
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Origin, Content-Type, Accept, Authorization';
            add_header 'Access-Control-Allow-Credentials' 'true';

            # Handle OPTIONS requests
            if ($request_method = 'OPTIONS') {
                return 204;
            }
        }
    }
}

rtmp {
    server {
        listen 1935;  # RTMP listen port for OBS
        chunk_size 4096;

        application live {
            live on;
            record off;

            # HLS settings
            hls on;  # Enable HLS streaming
            hls_path /var/www/hls/;  # Directory where .ts and .m3u8 files will be stored
            hls_fragment 3;  # Length of each HLS fragment in seconds
            hls_playlist_length 10;  # Duration of the HLS playlist in seconds
            hls_cleanup on;  # Automatically remove old .ts files
            allow publish all;  # Allow any client to publish streams (OBS)
            allow play all;  # Allow any client to play streams
        }
    }
}
