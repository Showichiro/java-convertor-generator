# java-convertor-generator

[![Deno](https://github.com/Showichiro/java-convertor-generator/actions/workflows/deno.yml/badge.svg)](https://github.com/Showichiro/java-convertor-generator/actions/workflows/deno.yml)

# Install

```sh
deno install https://raw.githubusercontent.com/Showichiro/java-convertor-generator/main/java-convertor-generator.ts
```

# Usage

```console
java convertor generate tool from excel

Usage: java-convertor-generator [options]

Options:
 -f, --file <file>                   excel file
 --fileDir <fileDir>                 excel file directory
 -o, --outdir <outdir>               output directory
 -h, --help                           show help message

Examples:
  java-convertor-generator -f ./test.xlsx
  java-convertor-generator --fileDir ./test
  java-convertor-generator -f ./test.xlsx -o ./out
  java-convertor-generator --fileDir ./test --outdir ./out
```
