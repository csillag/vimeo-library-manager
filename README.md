
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
sage: vimeo-library-manager [options] [command]

Options:
  -V, --version                                           output the version number
  -c, --config <config-file>                              path to config file (default:
                                                          "/home/csillag/.vimeo-library-manager/config.json")
  -d, --debug                                             output extra debugging
  -h, --help                                              display help for command

Commands:
  test                                                    Test your Vimeo access
  init <client-id> <client-secret> <client-redirect-url>  Initiate your Vimeo access
  start-login                                             Start the login process
  finish-login <code>                                     Finish the login process
  logout                                                  Log out from vimeo
  list-videos                                             List my videos
  help [command]                                          display help for command
```


