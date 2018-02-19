
function main() {
  var runningFlag = true;
  var timer;

  var nr_nodes = 100; // number of nodes
  var m = 0; // Erdos-Renyi parameter
  var rate = 500;

  var width = 800,
      height = 800,
      node_radius = 1;

  var force, nodes, links, node, link;
  var eigval, eigv, Matrix;

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
    var n1 = Math.floor(Math.random()*nr_nodes), n2;
    var obj;
    var i;

    findPerron();

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
      Matrix[n1][n2] = 0;
    } else {
      links.push(obj);
      Matrix[n2][n1] = 1;
    }

    //d3.event.stopPropagation();
    restart();
  }

  function startup() {

    activateButtons();

    var starting_nodes=[];
    var i,j;
    var x,y;

    eigv = new Array(nr_nodes);
    Matrix = new Array(nr_nodes);
    for( i=0; i< Matrix.length; i++) {
      Matrix[i] = new Array(nr_nodes);
      for( j=0; j< Matrix.length; j++) {
        Matrix[i][j] = 0;
      }
    }
    eigv = eigv.fill(1./nr_nodes);
//    for( i=0; i< eigv.length; i++) { eigv[i] = 1./nr_nodes }
    console.log(eigv);

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
          Matrix[j][i] = 1; // from i to j
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

function findPerron() {
  var iter = 5;
  var i,j;
  var sum;
  var vect = Array(nr_nodes);

  eigv = eigv.fill(1.0);

  while( iter-- > 0) {
//    vect = eigv;
    for(i=0; i<nr_nodes; i++) {
      for(sum=j=0; j<nr_nodes; j++) {
        sum += Matrix[i][j] * eigv[j];
      }
      vect[i] = sum;
    }

  //  for( i in eigv ) { sum += i; }
    for( sum=i=0; i< vect.length; i++) { sum += vect[i]; }
    if(sum>0) {
      eigv = vect.map( x => x/sum );
    }
  }
  for( sum=i=0; i< vect.length; i++) { sum += vect[i]; }
  eigval  = sum;
      
  console.log(eigv);
  console.log("eigval:" + eigval);
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
