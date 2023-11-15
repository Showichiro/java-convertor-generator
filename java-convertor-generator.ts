#!/usr/bin/env -S deno run -A --ext ts
import { argv, echo } from "npm:zx@7.1.1";
// @deno-types="https://cdn.sheetjs.com/xlsx-0.20.0/package/types/index.d.ts"
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs";
import { Eta } from "https://deno.land/x/eta@v3.0.3/src/index.ts";

const HELP = `
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
` as const;

const TEMPLATE = `package <%= it.packageName %>;

import <%= it.sourcePackage %>.<%= it.sourceClass %>;
import <%= it.destinationPackage %>.<%= it.destinationClass %>;
<% if(it.additionalPackages != null) { %>
<%~ it.additionalPackages %> 
<% } %>

public class <%= it.className %> {
  public static <%= it.destinationClass %> convert(
      <%= it.sourceClass %> source
  ) {
    <%= it.destinationClass %> destination = new <%= it.destinationClass %>();
    <% it.items.forEach(( item ) => { %>
      <% if(item.method) {%>
        <%= item.method %>;
      <% } else { %>
        destination.set<%= item.destination_property %>(source.get<%= item.source_property %>());
      <% } %> 
    <% }) %>
    return destination;
  }

<% if(it.additionalMethod != null) { %>
  <%~ it.additionalMethod %>
<% } %>
}

` as const;

const DEFAULT_OUTDIR = "./out" as const;

const CONFIG = "config" as const;
const TARGET = "target" as const;

const DEFAULT_PACKAGE_NAME = "com.example" as const;
const DEFAULT_CLASS_NAME = "JavaConvertor" as const;
const DEFAULT_METHOD_NAME = "convert" as const;

type Config =
  | "package_name"
  | "class_name"
  | "method_name"
  | "source_package"
  | "source_class"
  | "destination_package"
  | "destination_class"
  | "additional_packages"
  | "additional_method";

type ConfigType = {
  config: Config;
  value: string;
};

type TargetType = {
  source_property: string;
  destination_property: string;
  method: string | null;
};

const fileExists = (filepath: string): boolean => {
  try {
    const file = Deno.statSync(filepath);
    return file.isFile;
  } catch (_e) {
    return false;
  }
};

const dirExists = (dirpath: string): boolean => {
  try {
    const file = Deno.statSync(dirpath);
    return file.isDirectory;
  } catch (_e) {
    return false;
  }
};

const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

{
  if (argv.help || argv.h) {
    echo`${HELP}`;
    Deno.exit(0);
  }

  let fileList: string[] = [];
  // get filenames
  const files = argv.f || argv.file;
  const fileDir = argv.fileDir;
  if (!files && !fileDir) {
    echo`you need to choose file`;
    echo`${HELP}`;
    Deno.exit(1);
  }
  if (typeof fileDir === "string") {
    const dir = Deno.readDirSync(fileDir);
    for await (const entry of dir) {
      if (entry.isFile && entry.name.endsWith(".xlsx")) {
        fileList = [...fileList, `${fileDir}/${entry.name}`];
      }
    }
  }
  if (files) {
    if (typeof files === "string") {
      fileList = [...fileList, files];
    } else if (Array.isArray(files)) {
      fileList = [...fileList, ...files];
    }
  }
  echo`check ${files}...`;
  // check file exist
  fileList.forEach((file) => {
    const isExists = fileExists(file);
    if (!isExists) {
      echo`file is not exists ${file}`;
      Deno.exit(1);
    }
  });
  // check file is excel
  const isNotExcel = fileList.some((file) => !file.endsWith(".xlsx"));
  if (isNotExcel) {
    echo`file is not excel`;
    Deno.exit(1);
  }

  const outDir = argv.o ?? argv.outDir ?? DEFAULT_OUTDIR;
  // delete outdir
  if (dirExists(outDir)) {
    Deno.removeSync(outDir, { recursive: true });
  }

  Deno.mkdirSync(outDir);

  const eta = new Eta();
  const encoder = new TextEncoder();
  // exec every file
  fileList.forEach((file) => {
    // load message
    echo`load ${file}...`;
    const workbook = XLSX.readFile(file);

    // get config sheet
    const configSheet = workbook.Sheets[CONFIG];
    if (!configSheet) {
      echo`config sheet is not exists`;
      Deno.exit(1);
    }
    const config = new Map(
      XLSX.utils
        .sheet_to_json<ConfigType>(configSheet)
        .map<[Config, string]>((val) => [val.config, val.value]),
    );
    if (
      !(
        config.has("source_class") &&
        config.has("source_package") &&
        config.has("destination_class") &&
        config.has("destination_package")
      )
    ) {
      echo`config sheet requires source_class & source_package & destination_class & destination_package`;
      Deno.exit(1);
    }

    const targetSheet = workbook.Sheets[TARGET];
    const target = XLSX.utils.sheet_to_json<TargetType>(targetSheet) ?? [];

    const content = eta.renderString(TEMPLATE, {
      packageName: config.get("package_name") ?? DEFAULT_PACKAGE_NAME,
      className: config.get("class_name") ?? DEFAULT_CLASS_NAME,
      sourcePackage: config.get("source_package"),
      sourceClass: config.get("source_class"),
      destinationPackage: config.get("destination_package"),
      destinationClass: config.get("destination_class"),
      methodName: config.get("method_name") ?? DEFAULT_METHOD_NAME,
      items: target.map((val) => ({
        source_property: capitalize(val.source_property),
        destination_property: capitalize(val.destination_property),
        method: val.method,
      })),
      additionalPackages: config.get("additional_packages") ?? null,
      additionalMethod: config.get("additional_method") ?? null,
    });
    const filename = `${config.get("class_name") ?? DEFAULT_CLASS_NAME}.java`;
    echo`generate ${filename}...`;
    Deno.writeFileSync(filename, encoder.encode(content));
    Deno.renameSync(filename, `${outDir}/${filename}`);
    echo`generated ${outDir}/${filename}`;
  });

  Deno.exit(0);
}
