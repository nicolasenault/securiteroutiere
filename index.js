"use strict";

// line chart code: https://bl.ocks.org/d3noob/402dd382a51a4f6eea487f9a35566de0
// time series from: http://bl.ocks.org/mbostock/3883245
// set the dimensions and margins of the graph
var margin = { top: 20, right: 20, bottom: 30, left: 50 },
    height = 500 - margin.top - margin.bottom;
var maxWidth = 940 - margin.left - margin.right;
var width = 940 - margin.left - margin.right;

var parseTime = d3.timeParse("%Y");
var _x = d3.scaleTime().range([0, width]);
var _y = d3.scaleLinear().range([height, 0]);
var formatTime = d3.timeFormat("%Y");

var valueline = d3.line().x(function (d) {
  return _x(d.year);
}).y(function (d) {
  return _y(d.death);
});

var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

var svg = d3.select("svg").attr("width", 940).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data.csv", function (error, data) {
  if (error) throw error;

  data.forEach(function (d) {
    d.year = parseTime(d.year);
    d.death = +d.death;
  });

  _x.domain(d3.extent(data, function (d) {
    return d.year;
  }));
  _y.domain([0, d3.max(data, function (d) {
    return d.death;
  })]);

  svg.append("path").data([data]).attr("class", "line").attr("d", valueline);

  svg.append("g").attr("class", "x-axis").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(_x));

  svg.append("g").call(d3.axisLeft(_y));
  
      svg.selectAll("dot")	
        .data(data)			
    .enter().append("circle")								
        .attr("r", 2.5)		
        .attr("cx", function(d) { return _x(d.year); })		 
        .attr("cy", function(d) { return _y(d.death); })		
        .on("mouseover", function(d) {		
            div.transition()		
                .duration(200)		
                .style("opacity", 1);		
            div	.html("En " + formatTime(d.year) + ", "  + d.death + " personnes ont perdu la vie dans un accident de la route.")	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            })					
        .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
        });

  //Add annotations
  var labels = [{ 
    data: { year: "1962", death: 11579, law: "60 km/h en agglomération" },
    dy: -50,
    dx: -1
  }, {
	data: { year: "1973", death: 16861, law: "Port de la ceinture obligatoire à l'avant hors agglomération, et port du casque pour les deux roues" },
    dy: 0,
    dx: 140
  }, {
	data: { year: "1974", death: 14526, law: "Abaissement des limitations de vitesse : 130 km/h sur les autoroutes, 110 km/h sur les voies expresses a 2 x 2 voies et 90 km/h sur les routes" },
    dy: 120,
    dx: -60
  }, {
	data: { year: "1979", death: 13295, law: "Port de la ceinture obligatoire à l'avant en agglomération" },
    dy: 37,
    dx: -1
  }, {
	data: { year: "1983", death: 12728, law: "0,8 g/l d'alcool dans le sang" },
    dy: 110,
    dx: -1
  }, {
    data: { year: "1990", death: 11215, law:"Limitation à 50 km/h en agglomération et port de la ceinture à l'arrière" },
    dy: -1,
    dx: 120,
  }, {
    data: { year: "1992", death: 9900, law:"Mise en application du permis à points" },
    dy: 0,
    dx: 150,
  }, {
    data: { year: "1995", death: 8891, law:"0,5 g/l d'alcool dans le sang" },
    dy: 60,
    dx: -20,
  }, {
    data: { year: "2003", death: 6058, law: "Mise en place des contrôle-sanction radars" },
    dy: 37,
    dx: -37
  },{
    data: { year: "2004", death: 5593, law: "Mise en application du permis probatoire" },
    dy: 70,
    dx: 0
  },{
    data: { year: "2008", death: 4275, law: "Gilet et triangle obligatoire" },
    dy: -10,
    dx: 10
  }].map(function (l) {
    l.note = Object.assign({}, l.note, { title: l.data.year,
      label: "" + l.data.law });
    l.subject = { radius: 4 };

    return l;
  });

  var timeFormat = d3.timeFormat("%d-%b-%y");

  window.makeAnnotations = d3.annotation().annotations(labels).type(d3.annotationCalloutCircle).accessors({ x: function x(d) {
      return _x(parseTime(d.year));
    },
    y: function y(d) {
      return _y(d.death);
    }
  }).accessorsInverse({
    year: function year(d) {
      return timeFormat(_x.invert(d.x));
    },
    death: function death(d) {
      return _y.invert(d.y);
    }
  }).on('subjectover', function (annotation) {
    annotation.type.a.selectAll("g.annotation-connector, g.annotation-note").classed("hidden", false);
  }).on('subjectout', function (annotation) {
    annotation.type.a.selectAll("g.annotation-connector, g.annotation-note").classed("hidden", false);
  });

  svg.append("g").attr("class", "annotation-test").call(makeAnnotations);

  svg.selectAll("g.annotation-connector, g.annotation-note").classed("hidden", false);
});