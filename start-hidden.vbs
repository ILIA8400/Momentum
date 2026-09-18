' Runs Momentum in the background (no console window). To stop it: stop.bat
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = dir
sh.Run "cmd /c node server.js --open", 0, False
