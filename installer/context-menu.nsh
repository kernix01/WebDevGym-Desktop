!macro customInstall
  WriteRegStr HKCU "Software\Classes\*\shell\WebDevGym" "" "Открыть в WebDevGym"
  WriteRegStr HKCU "Software\Classes\*\shell\WebDevGym" "Icon" "$INSTDIR\WebDevGym.exe,0"
  WriteRegStr HKCU "Software\Classes\*\shell\WebDevGym\command" "" '$\"$INSTDIR\WebDevGym.exe$\" --open-path $\"%1$\"'

  WriteRegStr HKCU "Software\Classes\Directory\shell\WebDevGym" "" "Открыть в WebDevGym"
  WriteRegStr HKCU "Software\Classes\Directory\shell\WebDevGym" "Icon" "$INSTDIR\WebDevGym.exe,0"
  WriteRegStr HKCU "Software\Classes\Directory\shell\WebDevGym\command" "" '$\"$INSTDIR\WebDevGym.exe$\" --open-path $\"%1$\"'

  WriteRegStr HKCU "Software\Classes\Directory\Background\shell\WebDevGym" "" "Открыть в WebDevGym"
  WriteRegStr HKCU "Software\Classes\Directory\Background\shell\WebDevGym" "Icon" "$INSTDIR\WebDevGym.exe,0"
  WriteRegStr HKCU "Software\Classes\Directory\Background\shell\WebDevGym\command" "" '$\"$INSTDIR\WebDevGym.exe$\" --open-path $\"%V$\"'
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\*\shell\WebDevGym"
  DeleteRegKey HKCU "Software\Classes\Directory\shell\WebDevGym"
  DeleteRegKey HKCU "Software\Classes\Directory\Background\shell\WebDevGym"
!macroend
