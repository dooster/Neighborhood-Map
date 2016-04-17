module.exports=function(grunt){function getReferencedSources(sourceReferencesFilename){var result;return global.knockoutDebugCallback=function(e){result=e},eval(grunt.file.read(sourceReferencesFilename)),result}function getCombinedSources(){var e=grunt.config("fragments"),n=[e+"extern-pre.js",e+"amd-pre.js",getReferencedSources(e+"source-references.js"),e+"amd-post.js",e+"extern-post.js"],t=Array.prototype.concat.apply([],n),r=t.map(function(e){return grunt.file.read("./"+e)}).join("");return r.replace("##VERSION##",grunt.config("pkg.version"))}function buildDebug(e){var n=[];n.push(grunt.config("banner")),n.push("(function(){\n"),n.push("var DEBUG=true;\n"),n.push(getCombinedSources()),n.push("})();\n"),grunt.file.write(e,n.join("").replace(/\r\n/g,"\n"))}function buildMin(e,n){var t=require("closure-compiler"),r={compilation_level:"ADVANCED_OPTIMIZATIONS",output_wrapper:"(function() {%output%})();"};grunt.log.write("Compiling..."),t.compile("/**@const*/var DEBUG=false;"+getCombinedSources(),r,function(t,r,i){t?(grunt.log.error(t),n(!1)):(grunt.log.ok(),grunt.file.write(e,(grunt.config("banner")+r).replace(/\r\n/g,"\n")),n(!0))})}var _=grunt.util._;grunt.initConfig({pkg:grunt.file.readJSON("package.json"),fragments:"./build/fragments/",banner:"/*!\n * Knockout JavaScript library v<%= pkg.version %>\n * (c) Steven Sanderson - <%= pkg.homepage %>\n * License: <%= pkg.licenses[0].type %> (<%= pkg.licenses[0].url %>)\n */\n\n",checktrailingspaces:{main:{src:["**/*.{js,html,css,bat,ps1,sh}","!build/output/**","!node_modules/**"],filter:"isFile"}},build:{debug:"./build/output/knockout-latest.debug.js",min:"./build/output/knockout-latest.js"},dist:{debug:"./dist/knockout.debug.js",min:"./dist/knockout.js"},test:{phantomjs:"spec/runner.phantom.js",node:"spec/runner.node.js"}}),grunt.registerTask("clean","Clean up output files.",function(e){var n=grunt.config("build"),t=[n.debug,n.min],r={force:"force"==e};return _.forEach(t,function(e){grunt.file.exists(e)&&grunt.file["delete"](e,r)}),!this.errorCount});var trailingSpaceRegex=/[ ]$/;grunt.registerMultiTask("checktrailingspaces","checktrailingspaces",function(){var e=[];return this.files[0].src.forEach(function(n){var t=grunt.file.read(n),r=t.split(/\r*\n/);r.forEach(function(t,r){trailingSpaceRegex.test(t)&&e.push([n,r+1,t].join(":"))})}),e.length?(grunt.log.error("The following files have trailing spaces that need to be cleaned up:"),grunt.log.writeln(e.join("\n")),!1):void 0}),grunt.registerMultiTask("build","Build",function(){if(!this.errorCount){var e=this.data;"debug"===this.target?buildDebug(e):"min"===this.target&&buildMin(e,this.async())}return!this.errorCount}),grunt.registerMultiTask("test","Run tests",function(){var e=this.async();grunt.util.spawn({cmd:this.target,args:[this.data]},function(n,t,r){127===r?(grunt.verbose.error(t.stderr),e(!0)):(grunt.log.writeln(t.stdout),n&&grunt.log.error(t.stderr),e(!n))})}),grunt.registerTask("dist",function(){var e=grunt.config("pkg.version"),n=grunt.config("build"),t=grunt.config("dist");grunt.file.copy(n.debug,t.debug),grunt.file.copy(n.min,t.min),console.log("To publish, run:"),console.log("    git add bower.json"),console.log("    git add -f "+t.debug),console.log("    git add -f "+t.min),console.log("    git checkout head"),console.log("    git commit -m 'Version "+e+" for distribution'"),console.log("    git tag -a v"+e+" -m 'Add tag v"+e+"'"),console.log("    git checkout master"),console.log("    git push origin --tags")}),grunt.registerTask("default",["clean","checktrailingspaces","build","test"])};