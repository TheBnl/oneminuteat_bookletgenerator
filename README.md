# OneMinuteAt Publication Generator

One Minute At Publication Generator is an booklet generator that converts a logfile into an printable html page.
One Minute At is an series of visual archives to show data i intercepted in short sessions. This repository holds an node.js generator scripts that transforms my captured logfile into an printable pdf.
The script scans trough the folder logs/ and generates a printable html page per found file at localhost:5000/print/logfile.log.

To generate a booklet you need to run the fllowing comand from terminal:

`prince http://localhost:5000/print/logfile.log -o output.pdf`

Make sure you have the node server running on the correct port and have [prince](http://www.princexml.com/download/) installed.