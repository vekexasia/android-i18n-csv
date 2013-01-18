android-i18n-csv
================

Ability to convert string resources to/from csv. Useful mainly if translators are not able to deal with string.xml resource files.

# Export

```bash
node export.js --xml /path/to/strings.xml --origlang en --wantedlangs it,de,fr,nl
```

The command above will generate a csv file with all the required columns in order to manage translations for the given languages.


# Import

```bash
node import.js --csv /path/to/strings.csv --deflang en --folderout path/to/projectfolder
```

This command will use as source a given csv file ( that must use the same _format_ of the csv files generated from the export command ) 

## General usage

Original string resource files are tricky to most non-developer-humans to read/edit. By importing the generated csv file into googledrive you can share a spreadsheet to the translation team which can co-edit.

Once the translation team finished the task on Google Drive you can Download the result as csv and then use the import routine.

