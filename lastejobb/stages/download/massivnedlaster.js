const { processes, log } = require("lastejobb");

log.info("Kjører Massivnedlaster...");
const cmd = "/usr/bin/dotnet";
const args = [
  "exec",
  "$PWD/Geonorge.NedlastingKlient/Console/bin/Debug/netcoreapp2.1/Geonorge.Nedlaster.dll default"
];
//const args = "exec /home/grunnkart/Geonorge.NedlastingKlient/Console/bin/Debug/netcoreapp2.1/Geonorge.Nedlaster.dll default"
processes.exec(cmd, args);
