
function main() {
  var runningFlag = true;
  var timer;

  var nr_nodes = 10; // number of nodes
  var m = 0; // Erdos-Renyi parameter
  var rate = 500;

  var width = 800,
      height = 800,
      node_radius = 1;

  var force, nodes, links, node, link;

  var svg = d3.select("#simulation").append("svg")
      .attr("width", width)
      .attr("height", height);

  svg.append("rect")
      .attr("width", width)
      .attr("height", height);

      defs = svg.append("defs")

  		defs.append("marker")
  				.attr({
  					"id":"arrowtip",
  					"viewBox":"0 -5 10 10",
  					"refX":5,
  					"refY":0,
  					"markerWidth":4,
  					"markerHeight":4,
  					"orient":"auto"
  				})
  				.append("path")
  					.attr("d", "M0,-5L10,0L0,5")
  					.attr("class","arrowHead");

  startup();
  restart();

  timer = setInterval(run, rate);

  function run() {
    modelDynamics();
    //pieDynamics();
  }

  function modelDynamics() {
    let n1 = Math.floor(Math.random()*nr_nodes), n2;
    let obj;
    let i;

    do {
      n2 = Math.floor(Math.random()*nr_nodes);
    } while(n1 == n2);
    //console.log(n1,n2);
    obj = {source: n1, target: n2};

    for (i=0; i< links.length; i++) {
      if( (links[i].source.idx == n1 && links[i].target.idx == n2)||
          (links[i].source.idx == n2 && links[i].target.idx == n1)) {
        break;
      }
    }
    if( i<links.length) {
      links.splice(i,1);
    } else {
      links.push(obj);
    }

    //d3.event.stopPropagation();
    restart();
  }

  function startup() {

    activateButtons();

    let starting_nodes=[];
    let i,j;
    let x,y;

    for (i=0; i<nr_nodes; i++) {
      x = Math.random() * width;
      y = Math.random() * height;
      starting_nodes.push({
        idx: i,
        x: x,
        y: y
      })
    }
    force = d3.layout.force()
        .size([width, height])
        .nodes(starting_nodes) // initialize with a single node
        .linkDistance(30)
        .charge(-60)
        .gravity(0.05)
        .on("tick", tick);

    nodes = force.nodes();
    links = force.links();
    node = svg.selectAll(".node");
    link = svg.selectAll(".link");

    node = node.data(nodes);

    node.enter().insert("circle")
        .attr("class", "node")
        .attr("r", node_radius);

    for (i=0; i<nr_nodes; i++) {
      for (j=0; j<i; j++) {
        if(Math.random()<m) {
          links.push({source: i, target: j});
        }
      }
    }
  }

  function tick() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }

  function restart() {
    //console.log(nodes);

    link = link.data(links);

    link.enter().insert("line", ".node")
        .attr("class", "link")
        .attr({
					"class":"arrow",
					"marker-end":"url(#arrowtip)"
        });

    link.exit()
        .remove();

    force.start();
  }

  function pauseSym() {
    if (runningFlag) {
      clearInterval(timer);
      runningFlag = false;
    } else {
      timer = setInterval(run, rate);
      runningFlag = true;
    }
  }

  function restartSym() {
    clearInterval(timer);
  }

  function activateButtons() {

    ///// Buttons //////
      d3.select("#pauseB")
        .on("click", pauseSym);

      d3.select("#restartB")
        .on("click", restartSym);
    ////////////////////
    // inputs //
      d3.select("#mValue").on("input", function() {
        m = +this.value;
      });
      d3.select("#rateValue").on("input", function() {
        rate = +this.value;
        clearInterval(timer);
        if(runningFlag) timer = setInterval(run, rate);
      });
    ////////////


  }

}
