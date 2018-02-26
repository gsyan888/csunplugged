#!/usr/bin/env python

"""Utilty to compile CS Unplugged 
"""

import optparse
import subprocess
import os

compiledPath = 'compiled'
limeCmd = os.path.join('bin','lime.py')

csunpluggedPath = os.getcwd();
lime_folder_name, current_folder_name = os.path.split(csunpluggedPath)
if current_folder_name == 'csunplugged' :
    lime_folder_name = '..'

else :
    lime_folder_name = '.'
    csunpluggedPath = os.path.join(csunpluggedPath, 'csunplugged') 

limeCmd = os.path.join(lime_folder_name , limeCmd)


def build(target) :
    jsFile = target + '.js'
    jsFilePath = os.path.join(csunpluggedPath, target, jsFile)
    if os.path.exists(jsFilePath) :
        outputPath = os.path.join(lime_folder_name, compiledPath, 'html5_'+target, jsFile)
        print '\n\n'
        print '*****************************\n'
        print 'compiling cs.'+target+'\n'
        print '*****************************\n'
        subprocess.call(limeCmd+' build cs.'+ target + ' -a -o '+outputPath, shell=True) 	
    else :
        print 'file note found : '+jsFilePath



def build_all() :
    for d in os.listdir(csunpluggedPath) :
		build(d)


def make_index_page() :

    header = """<html>
<head>
<title>CS Unplugged</title>
<style>
h1 {
    text-align: center;
    color: #31B404;
  }
#css_table {
      display:table;
      width:100%
  }
.css_tr {
      display: table-row;
  }
.css_td {
      display: table-cell;
      border: 0px solid black;
      text-align:center;
      vertical-align:middle;
      height : 120pt;
  }
img {
	width: 60pt;
	height: 60pt;
  }
#url {
	color: #31B404;
	text-align:center;
	padding-top: 36pt;
  }
#url a:link, #url a:visited {
	color: #38610B;
  }
.source {
	font-size:8px;
  }
</style>
</head>
<body>
<h1>CS Unplugged</h1>
<div id="css_table">
"""
    footer ="""
<div id="url"><div class="source">SOURCE:</div><a href="https://github.com/gsyan888/csunplugged">https://github.com/gsyan888/csunplugged</a></div>
</body>
</html>
"""
    outfilePath = os.path.join(lime_folder_name, 'index.html')
    outfile = open(outfilePath, 'w')
    outfile.write( header )
    
    col_total = 4
    row = 0
    for d in os.listdir(csunpluggedPath) :
        pageFile = os.path.join(compiledPath, 'html5_'+d, d + '.html')
        pageFilePath = os.path.join(lime_folder_name, pageFile)
        if os.path.exists(pageFilePath) :
            if row > 0 and row%col_total == 0 :
                outfile.write( '</div>\n' )  #end of tr
            if row%col_total == 0 :
                outfile.write( '<div class="css_tr">\n' )
            outfile.write( '<div class="css_td">\n' )
            url = pageFile.replace(os.sep, '/')
            icon = os.path.join(compiledPath, 'html5_'+d, 'assets', 'icon.png')
            iconPath = os.path.join(lime_folder_name, icon)
            if os.path.exists(iconPath) :
                iconUrl = icon.replace(os.sep, '/')
                outfile.write( '<a href="'+ url + '"><img src="'+iconUrl+'"></a>\n' )
            outfile.write( '<br /><a href="'+ url + '">'+d+'</a>\n' ) 
            outfile.write( '</div>\n' )   #end of td
            row = row+1
    
    outfile.write( '</div>\n' )   #end of tr
    outfile.write( '</div>\n' )   #end of table
    outfile.write( footer )    
    outfile.close()
    print 'Create index page : ' + outfilePath + '\n'

            
def main():
    """The entrypoint for this script."""
    
    usage = """usage: %prog [target]
Targets :
	all		Compile all projects in csunplugged directory
	index		Create the index page
	directory	Compile single project in csunplugged directory
    """
    parser = optparse.OptionParser(usage)
    
    (options, args) = parser.parse_args()
    if not (len(args) == 1) :
        parser.error('incorrect number of arguments')
    
    if args[0]=='all' :
        build_all()
    
    elif args[0]=='index' :
        make_index_page()
        
    else :
        jsFile = args[0] + '.js'
        jsFilePath = os.path.join(csunpluggedPath, args[0], jsFile)
        if not os.path.exists(jsFilePath) :
            print 'Can not found ' + jsFilePath+'\n'            
        else :
        	build(args[0])

if __name__ == '__main__':
    main()