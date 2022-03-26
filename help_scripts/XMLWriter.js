//source: https://www.codeproject.com/Articles/12504/Writing-XML-using-JavaScript

function XMLWriter()
{
    this.XML=[];
    this.Nodes=[];
    this.State="";
    this.FormatXML = function(Str)
    {
        if (Str)
            return Str.replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return ""
    }
    this.BeginNode = function(Name)
    {
        if (!Name) return;
        if (this.State=="beg") this.XML.push(">");
        this.State="beg";
        if (this.XML.length != 0) {
        	addLineBreak(this.XML, this.Nodes.length);
        }
        this.Nodes.push(Name);
        this.XML.push("<"+Name);
    }
    this.EndNode = function()
    {
    	addLineBreak(this.XML, this.Nodes.length - 1);
        if (this.State=="beg")
        {
            this.XML.push("/>");
            this.Nodes.pop();
        }
        else if (this.Nodes.length>0)
            this.XML.push("</"+this.Nodes.pop()+">");
        this.State="";
    }
    this.Attrib = function(Name, Value)
    {
        if (this.State!="beg" || !Name) return;
        this.XML.push(" "+Name+"=\""+this.FormatXML(Value)+"\"");
    }
    this.WriteString = function(Value)
    {
        if (this.State=="beg") this.XML.push(">");
        this.XML.push(this.FormatXML(Value));
        this.State="";
    }
    this.Node = function(Name, Value)
    {
        if (!Name) return;
        if (this.State=="beg") this.XML.push(">");
        addLineBreak(this.XML, this.Nodes.length);
        this.XML.push((Value=="" || !Value)?"<"+Name+"/>":"<"+Name+">"+this.FormatXML(Value)+"</"+Name+">");
        this.State="";
    }
    this.Close = function()
    {
        while (this.Nodes.length>0)
            this.EndNode();
        this.State="closed";
    }
    this.ToString = function(){return this.XML.join("");}
}

function addLineBreak(xml, nodes) {
	var tbs = "";
	for (var i = 0; i < nodes; i++) {
		tbs += "\t";
	}
	xml.push("\n" + tbs);
}