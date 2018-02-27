
function main() {
  var runningFlag = true;
  var timer;

  var nr_nodes = 40; // number of nodes
  var Kin = 0.5; // average in-degree
  var rate = 500;
  var m = Kin/(nr_nodes-1);
  var pool_min = 5; // number of nodes to extract the minimum population

  var width = 600,
      height = 600,
      node_radius = 3;

  var force, nodes=[], links=[], node, link;
  var eigval, Matrix;

  var eigv = new Array(nr_nodes);
  eigv = eigv.fill(1./nr_nodes);

//// set the canvas dimensions
  d3.select("#wrapper")
    .style("width", 25 + width*4/3 + "px");

//// for the parameter panel
  d3.select("#parameters")
  .style("width", width/3 + "px")
  .style("height", height+"px");

//// for the simulation
  var svg = d3.select("#simulation").append("svg")
      .attr("width", width)
      .attr("height", height);

  // svg.append("rect")
  //     .attr("width", width)
  //     .attr("height", height);


//// definition of arrows
  var defs = svg.append("defs")

  defs.append("marker")
  				.attr({
  					"id":"arrowtip",
  					"viewBox":"0 -5 10 10",
  					"refX":20,
  					"refY":0,
  					"markerWidth":4,
  					"markerHeight":4,
  					"orient":"auto"
  				})
  				.append("path")
  					.attr("d", "M0,-5L10,0L0,5")
  					.attr("class","arrowHead");
///////////////////////////

//// for the eigenvector panel
var margin_eigvect = {top: 20, right: 20, bottom: 20, left: 50};
var width_eigvect = width- margin_eigvect.left - margin_eigvect.right;
var height_eigvect = Math.floor(width/4)- margin_eigvect.top - margin_eigvect.bottom;

var svg_eigvect = d3.select("#eigvect")
    .style("width", width+"px")
    .style("height", Math.floor(width/4)+"px")
    .append("svg")
      .attr("width", width)
      .attr("height", Math.floor(width/4));

var g_eigvect = svg_eigvect.append("g")
        .attr("transform", "translate(" + margin_eigvect.left + "," + margin_eigvect.top + ")");

var x_eigvect = d3.scale.ordinal().rangeRoundBands([0, width_eigvect],0.1),
    y_eigvect = d3.scale.linear().rangeRound([height_eigvect, 0]);

    x_eigvect.domain(eigv.map(function(d,i) { return i; }));
//    y_eigvect.domain([0, d3.max(bars)]);
    y_eigvect.domain([0, 1]);

    g_eigvect.selectAll(".bar")
          .data(eigv)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("id", function(d,i) { return "bar-"+i;})
            .attr("x", function(d,i) { return x_eigvect(i); })
            //.style("fill", "steelblue")
            .attr("y", function(d) { return y_eigvect(d); })
            .attr("width", x_eigvect.rangeBand())
            .attr("height", function(d) { return height_eigvect - y_eigvect(d); })
            .on("mouseover", mouseoverbar)
            .on("mouseout", mouseoutbar);

//// now the axes
    g_eigvect.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + y_eigvect(0) + ")")
            .call(d3.svg.axis().scale(x_eigvect).orient("bottom").ticks(10,",.0f"));
              //d3.axisBottom(x_eigvect).ticks(10,",.0f"));

    g_eigvect.append("text")
            .attr("id", "label--x")
            .attr("transform", "translate(" + (width_eigvect-15) + "," + (height_eigvect-5) + ")")
            .text("Index");

    g_eigvect.append("g")
            .attr("class", "axis axis--y")
            .attr("transform", "translate("+ x_eigvect(0) +","+ y_eigvect(1) + ")")
            .call(d3.svg.axis().scale(y_eigvect).orient("left"));
            //  d3.axisLeft(y_eigvect).ticks(10,",.2f"));

    g_eigvect.append("text")
            .attr("id", "label--y")
            .attr("transform", "translate(" + (-25) + "," + (height_eigvect/2+50) + ")rotate(-90)")
            .text("eigenvector component");

    g_eigvect.append("text")
            .attr("id", "title--eigvect")
            .attr("transform", "translate(" + (Math.floor(width_eigvect/2)) + ", -2)")
            .text("Perron-Frobenius eigenvector");

//////////////////////////
  startup();
  restart();

  timer = setInterval(run, rate);

  function run() {
    modelDynamics();
    //pieDynamics();
  }

/////******************/////
/////******************/////
  function startup() {
/////******************/////

    activateButtons();

    var starting_nodes=[];
    var i,j;
    var x,y;

//    eigv = new Array(nr_nodes);
    Matrix = new Array(nr_nodes);
    for( i=0; i< Matrix.length; i++) {
      Matrix[i] = new Array(nr_nodes);
      for( j=0; j< Matrix.length; j++) {
        Matrix[i][j] = 0;
      }
    }

    //console.log(eigv);

    for (i=0; i<nr_nodes; i++) {
      x = Math.random() * width;
      y = Math.random() * height;
      starting_nodes.push({
        idx: i,
        x: x,
        y: y
      })
    }

    for (i=0; i<nr_nodes; i++) {
      for (j=0; j<nr_nodes; j++) {
        if(i!==j && Math.random()<m) {
          links.push({source: i, target: j});
          Matrix[j][i] = 1; // from i to j
        }
      }
    }

    force = d3.layout.force()
        .size([width, height])
        .nodes(starting_nodes)
        .links(links)
        .linkDistance(30)
        .charge(-60)
        .gravity(0.05)
        .on("tick", tick);

    nodes = force.nodes();
//    links = force.links();
    node = svg.selectAll(".node");
    link = svg.selectAll(".link");

    node = node.data(nodes);

    node.enter().insert("circle")
        .attr("class", "node")
        .attr("id", function(d,i) { return "node-"+i;})
        .attr("r", node_radius)
        .append("svg:title")
        .text(function(d,i){return i;});

        node.on("mouseover", mouseovernode)
        .on("mouseout", mouseoutnode);

  }

/////******************/////
/////******************/////
  function modelDynamics() {
/////******************/////

    var i;
    var maxscale;
    var vector=[];

    findPerron();

    maxscale = d3.max(eigv);
    if(maxscale>0) {
      y_eigvect.domain([0, maxscale]);
    } else {
      maxscale = 1;
    }
    d3.select(".axis--y")
      .attr("transform", "translate("+ x_eigvect(0) +","+ y_eigvect(maxscale) + ")")
      .call(d3.svg.axis().scale(y_eigvect).orient("left"));

    g_eigvect.selectAll(".bar")
          .data(eigv)
          .transition()
          .duration(0.7*rate)
            .attr("y", function(d) { return y_eigvect(d); })
            .attr("height", function(d) { return height_eigvect - y_eigvect(d); });

    for(i=0; i<eigv.length; i++) {
      vector.push({idx:i, val:eigv[i]});
    }
    //vector = eigv.slice(); // trick to copy an array by value

// select a random element among the pool_min least populated nodes
    vector = vector.sort(function(a, b){return a.val - b.val}).splice(0,pool_min);
    var rnd_item = vector[Math.floor(Math.random()*vector.length)].idx;

//// implementation of Jain-Krishna
    //links = links.filter( i => (i.source.idx !== rnd_item && i.target.idx !== rnd_item));
    // cannot do filter since the vector links is bound to the force mechanism
    i=0; do {
        if(links.length>0 && (links[i].source.idx == rnd_item || links[i].target.idx == rnd_item)) {
          links.splice(i,1);
          i--;
        }
        i++;
    } while(i<links.length);

    for (i=0,j=rnd_item; i<nr_nodes; i++) {
        Matrix[i][j] = Matrix[j][i] = 0;
        if(i!==j && Math.random()<m) {
          links.push({source: i, target: j});
          Matrix[j][i] = 1; // from i to j
        }
        if(i!==j && Math.random()<m) {
          links.push({source: j, target: i});
          Matrix[i][j] = 1; // from i to j
        }
    }
////
    // do {
    //   n2 = Math.floor(Math.random()*nr_nodes);
    // } while(n1 == n2);
    //
    // obj = {source: n1, target: n2};
    //
    // for (i=0; i< links.length; i++) {
    //   if( (links[i].source.idx == n1 && links[i].target.idx == n2)){
    //       //||(links[i].source.idx == n2 && links[i].target.idx == n1)) {
    //     break;
    //   }
    // }
    // if( i<links.length) {
    //   links.splice(i,1);
    //   Matrix[n1][n2] = 0;
    // } else {
    //   links.push(obj);
    //   Matrix[n2][n1] = 1;
    // }

    restart();
  }

  /////******************/////
  /////******************/////
  function tick() {
  /////******************/////
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }

  /////******************/////
  /////******************/////
  function restart() {
  /////******************/////


  // https://github.com/wbkd/d3-extended
  // d3.selection.prototype.moveToFront = function() {
  //   return this.each(function(){
  //     this.parentNode.appendChild(this);
  //   });
  // };
  // d3.selection.prototype.moveToBack = function() {
  //     return this.each(function() {
  //         var firstChild = this.parentNode.firstChild;
  //         if (firstChild) {
  //             this.parentNode.insertBefore(this, firstChild);
  //         }
  //     });
  // };


    link = link.data(links);

    link.enter().insert("line", ".node")
//        .moveToBack()
        .attr("class", "link")
        .attr({
					"class":"arrow",
					"marker-end":"url(#arrowtip)"
        });

    link.exit()
        .remove();

    force.start();
  }

  /////******************/////
  /////******************/////
  function findPerron() {
  /////******************/////

    var iter = 10; // number of matrix multiplications to estimate PF eigval
    const eps = 1e-6; // our machine zero value
    var i,j;
    var sum;
    var vect = Array(nr_nodes);

    // start with a vector filled with ones
    eigv = eigv.fill(1.0);

    while( iter-- > 0) {
      // multiply the adjacency matrix and the vector
      for(i=0; i<nr_nodes; i++) {
        for(sum=j=0; j<nr_nodes; j++) {
          sum += Matrix[i][j] * eigv[j];
        }
        vect[i] = sum;
      }

      for( sum=i=0; i< vect.length; i++) { sum += vect[i]; }
      if(sum>eps) {
        eigv = vect.map( x => x/sum ); // thre is some positive element
      } else {
        eigv = eigv.fill(0.0);; // full of zeros
      }
    }
    for( sum=i=0; i< vect.length; i++) { sum += vect[i]; }
    eigval  = sum;

    //console.log(eigv);
    console.log("eigval:" + Math.round(1e3*eigval)/1e3);
  }

  /////******************/////
  /////******************/////
  function pauseSym() {
  /////******************/////
    if (runningFlag) {
      clearInterval(timer);
      runningFlag = false;
    } else {
      timer = setInterval(run, rate);
      runningFlag = true;
    }
  }

  /////******************/////
  /////******************/////
  function restartSym() {
  /////******************/////
    clearInterval(timer);
  }

  /////******************/////
  /////******************/////
  function activateButtons() {
  /////******************/////

    ///// Buttons //////
      d3.select("#pauseB")
        .on("click", pauseSym);

      d3.select("#restartB")
        .on("click", restartSym);
    ////////////////////
    // inputs //
      d3.select("#mValue")
        .on("input", function() {
            Kin = +this.value;
            m = Kin/(nr_nodes-1);
      });

      d3.select("#poolValue")
        .on("input", function() {
            pool_min = +this.value;
            if(pool_min>nr_nodes) { pool_min = nr_nodes; }
      });

      d3.select("#rateValue")
        .on("input", function() {
          rate = +this.value;
          clearInterval(timer);
          if(runningFlag) timer = setInterval(run, rate);
        });
    ////////////
  }

  /////******************/////
  /////******************/////
  function mouseovernode() {
  /////******************/////
    var id = d3.select(this).datum().idx;

    d3.select("#bar-" + id)
        .style("stroke", "black");
        //.attr("fill-opacity", "1.0");

    d3.select(this).transition()
        .duration(400)
        .attr("r", 10);
  }

  /////******************/////
  /////******************/////
  function mouseoutnode() {
  /////******************/////
    var id = d3.select(this).datum().idx;

    d3.select("#bar-"+id)
        .style("stroke", "white");
        //.attr("fill-opacity", "0.8");

    d3.select(this).transition()
        .duration(400)
        .attr("r", node_radius);
  }

  /////******************/////
  /////******************/////
  function mouseoverbar() {
  /////******************/////
    var id = d3.select(this).attr("id");
    var idx = id.match(/\d+/)[0];

    d3.select("#node-" + idx)
        .style("fill", "green")
        .transition()
          .duration(400)
          .attr("r", 10);

    d3.select(this)
        .style("fill", "green");
  }

  /////******************/////
  /////******************/////
  function mouseoutbar() {
  /////******************/////
    var id = d3.select(this).attr("id");
    var idx = id.match(/\d+/)[0];

    d3.select("#node-"+idx)
        .style("fill", "#f99")
        .transition()
          .duration(400)
          .attr("r", node_radius);

        d3.select(this)
            .style("fill", "steelblue");
  }

}
