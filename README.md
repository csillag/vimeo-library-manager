
## Purpose

`vimeo-library-manager` is a small utility to manager your Vimeo library,
that is, automatically upload and replace your videos as necessary,
as a part of some fully automated, non-interactive workflow.

## Requirements

You need to have:
 - A Vimeo user account
 - An application defined (go to https://developer.vimeo.com/apps to create one)
 - The App ID and Secret. (You can copy these from Vimeo's UI.)
 
### Why do I need an own application? I though this is the application?

In Vimeo's terminology, in order to talk to their APIs, you need to have an
application. An application is identified by an app ID and secret.

Further more, every application is tied to the specific user that has
created it. So if I provided you with the App ID and Secret I created 
for myself, whatever you do with this app would be connected to my name.

I think we can agree that this is not what we want.

## Supported operations

Not a lot ATM, since I just started writing this tool.

```
Usage: vimeo-library-manager [options] [command]

Options:
  -V, --version                                           output the version number
  -c, --config <config-file>                              path to config file
  -d, --debug                                             output extra debugging
  -h, --help                                              display help for command

Commands:
  test                                                    Test your Vimeo access
  setup <client-id> <client-secret> <redirect-url>        Set up your Vimeo access
  login [options]                                         Start the login process
  logout                                                  Log out from vimeo
  list-videos                                             List my videos
  open-video <video-id>                                   Open a video in a browser
  update-data [options] <video-id>                        Update video meta-data
  upload-video [options] <video-file>                     Upload a new video
  delete-video <video-id>                                 Delete a video
  replace-content [options] <video-id> <video-file-name>  Replace video content
  list-thumbnails <video-id>                              List the thumbnails for a video
  create-thumbnail [options] <video-id>                   Create a new thumbnail for the video
  recreate-thumbnail [options] <video-id>                 Re-create the thumbnail for the video
  help [command]                                          display help for command
```

### Uploading a video

You can upload a video, set metadata, and optionally display the result in a browser.

```
Usage: vimeo-library-manager upload-video [options] <video-file>

Upload a new video

Options:
  --set-title <title>                        Set title
  --set-description <description>            Set description
  --set-description-file <description-file>  Load description from a file
  --set-custom <JSON-data>                   Set custom JSON data
  --set-custom-file <JSON-data-file>         Set custom JSON data from a file
  --set-privacy <policy>                     Set privacy policy
  --set-password <password>                  Set the password
  --wait-for-encoding                        Wait until then video encoding finishes
  --open                                     Open in browser
  --write-id-to <id-file>                    Write the ID of the new video to a file
  -h, --help                                 display help for command
```


### Editing the meda-data of a video

You can provide a valid JSON string, with escaping and all that, to set any obsecure property.
About properties that can be edited, see [the API reference](https://developer.vimeo.com/api/reference/videos#edit_video).

There are also shortcuts:

```
Usage: vimeo-library-manager update-data [options] <video-id>

Update video meta-data

Options:
  --set-title <title>                        Set title
  --set-description <description>            Set description
  --set-description-file <description-file>  Load description from a file
  --set-custom <JSON-data>                   Set custom JSON data
  --set-custom-file <JSON-data-file>         Set custom JSON data from a file
  --set-privacy <policy>                     Set privacy policy
  --set-password <password>                  Set the password
  -h, --help                                 display help for command
```

So, for example, to change the title and description of a video:

```
vimeo-library-manager update-data 425342398 --set-title "New title" --set-description "new desc"
```

To make it password protected:

```
vimeo-library-manager update-data 425342398 --set-password "magic"
```

### Updating the content of a video


```
Usage: vimeo-library-manager replace-content [options] <video-id> <video-file-name>

Replace video content

Options:
  --wait-for-encoding      Wait until the video encoding finishes
  --open                   Open in browser
  --no-recreate-thumbnail  Don't recreate the thumbnail
  --ignore-hash            Ignore the results of the hash comparison, upload anyway
  --thumbnail-time-offset  Specify the time offset from where to take the thumbnail. (The default is from the middle
                           of the video.)
  -h, --help               display help for command
```
