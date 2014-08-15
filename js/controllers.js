angular.module('app.controllers', [])
  .controller('editor', ['$scope' , function($scope) {

    var graph = new joint.dia.Graph;

    var paper = new joint.dia.Paper({
        el: $('#myholder'),
        width: 1500,
        height:500,
        model: graph
    });
    var paper2 = new joint.dia.Paper({
        el: $('#myimage'),
        width: 1500,
        height:500,
        model: graph,
        interactive : false
    });

    var rect_w=100,rect_h=30;
    var rects=new Object();
    var texts=[];
    var cnt = 1;
    var dsteps =new Object();
    var dcnt = 0;
    var parallel_inner = new Object();
    var parallel_outer = new Object;
    var links = [];
    var vert = new Object();

    var start = new joint.shapes.basic.Circle({
        position:{ x:400,y:50},
        attrs:{circle:{fill:'black'}, text : {text:'Start',fill:'white'}}
    });
    var end = new joint.shapes.basic.Circle({
        position:{ x:600,y:400},
        attrs:{circle:{fill:'black'}, text : {text:'End',fill:'white'}}
    });
    graph.addCells([start,end]);

    var StepImage = new joint.shapes.basic.Rect({
        position: { x: 700, y: 10 },
        size: { width: 100, height: 30 },

        attrs: { rect: { fill: 'blue'}, text: { text: 'Step',fill:'white' } }
    });
    var DStepImage = new joint.shapes.basic.Path({
            size: { width: 70, height: 70 },
            position: { x: 840, y: 10 },
            attrs: {
                path: { d: 'M 30 0 L 60 30 30 60 0 30 z' ,fill : '#9FA4EB'},
                text: {
                    text: 'D',
                    'ref-y': .5 // basic.Path text is originally positioned under the element
                }
            }
    });
    var DeleteImage = new joint.shapes.basic.Rect({
        position: { x: 950, y: 10 },
        size: { width: 100, height: 30 },

        attrs: { rect: { fill: 'blue'}, text: { text: 'Delete',fill:'white' } }
    });
    graph.addCells([StepImage,DStepImage,DeleteImage]);
    paper.findViewByModel(StepImage).options.interactive = false;
    paper.findViewByModel(DStepImage).options.interactive = false;
    paper.findViewByModel(DeleteImage).options.interactive = false;

     // = AngularIssues.get({},{'id':1});

    function addDstep() {
        dcnt+=1;
        var rect = new joint.shapes.basic.Path({
            size: { width: 70, height: 70 },
            attrs: {
                path: { d: 'M 30 0 L 60 30 30 60 0 30 z' ,fill : '#9FA4EB'},
                text: {
                    text: 'D' + dcnt,
                    'ref-y': .5 // basic.Path text is originally positioned under the element
                }
            }
        });
        dsteps[rect.id]=1;
        graph.addCells([rect]);
    };
    $scope.addProcess = function(){
        addProcess();
    }
    $scope.addDstep = function(){
        addDstep();
    }
    function addProcess() {
            var rect = new joint.shapes.basic.Rect({
                position: { x: 100, y: 30 },
                size: { width: rect_w, height:rect_h },
                attrs: { rect: { fill: 'blue',rx: 15, ry: 15}, text: { text: 'Step' + cnt, fill: 'white' } }
            });
            cnt+=1;
            rects[rect.id]=1;
            //rects.push(rect);
            graph.addCells([rect]);
    };
    $scope.joinProcess = function() {

        var link = new joint.dia.Link({
            source: { id: rects[$scope.process1].id },
            target: { id: rects[$scope.process2].id }
        });
        links.push([link.id,rects[$scope.process1].id,rects[$scope.process2].id]);
        graph.addCells([link]); 
    };
    $scope.removeProcess = function(){
        rects[$scope.rprocess].remove();
    };
    $scope.removeText = function(){
        texts[$scope.rtext].remove();
    };
    $scope.addText = function(){
        var txt = new joint.shapes.basic.Text({
            position: {x:100,y:30},
            size: { width:100 , height:30},
            attrs: {text: {text: $scope.textdata }}
        });
        texts.push(txt);
        graph.addCells([txt]);
    }

    var state = 0;
    var click_id;
    var pos_x;
    var pos_y;
    function check_link(id1,id2){
        var fl=1;
        var allLinks=graph.getLinks();
        for (var i = 0; i <allLinks.length; i++) {
            for (var j=0; j < links.length; j++) { 
                if(links[j][1] == id1 && links[j][2] == id2 && links[j][0]==allLinks[i].id)
                {
                    fl=0;
                    break;
                }
            };
            if(fl==0)
            {
                break;
            }
        };
        return fl;
    }
    function setColor(par,cell){
            if(par)
            {
                cell.attr({
                    rect:{fill:'white'},
                    circle:{fill:'black'},
                    path:{fill:'#9FA4EB'},
                    text: { fill: 'white', 'font-size': 15 }
                });   
            }
            else
            {
                cell.attr({
                 rect:{fill:'blue'},
                 circle:{fill:'black'},
                 path:{fill:'#9FA4EB'},
                 text: { fill: 'white', 'font-size': 15 }
                });          
            }  
    }

    function onclick_join(cellView,ect,x,y) {
        //alert(state);
         if(state==0)
        {
            if(cellView.id!=StepImage.id && cellView.id!=DStepImage.id && cellView.id!=DeleteImage.id)
            {
                //alert("Initial");
                cellView.attr({
                    rect:{fill:'#E67E22'},
                    circle:{fill:'#E67E22'},
                    path:{fill:'#E67E22'},
                    text: { fill: 'white', 'font-size': 15 }
                });
                paper.$el.addClass('connecting');
                click_id=cellView;
                pos_x=x;
                pos_y=y;
                state=1;
            }
        }
        else
        {
            if(cellView.id==DeleteImage.id && click_id.id!=start.id && click_id.id!=end.id)
            {
                click_id.remove();
                dsteps[click_id.id]=0;
                parallel_outer[click_id.id]=0;
                rects[click_id.id]=0;
            }
            if(cellView.id!=click_id.id)//&& cellView instanceof joint.shapes.basic)
            {
                //checking if a link already present 
                 var dec = 0;
                 //alert(parallel_outer[cellView.id]);
                 if(dsteps[cellView.id])
                 {
                    var incoming = graph.getConnectedLinks(cellView, { outbound: true });        
                    if(incoming.length==1)
                    {
                        dec=1;
                    }
                 }
                 if (dsteps[click_id.id])
                 {
                    var outgoing = graph.getConnectedLinks(click_id, { inbound: true });        
                    if(outgoing.length==2)
                    {
                        dec = 1;
                    }
                 }
                 if(parallel_outer[cellView.id])
                 {
                    var incoming = graph.getConnectedLinks(cellView, { outbound: true });        
                    if(incoming.length==1)
                    {
                        dec=1;
                    }
                 }
                 if (parallel_outer[click_id.id])
                 {
                    var outgoing = graph.getConnectedLinks(click_id, { inbound: true });        
                    if(outgoing.length==1)
                    {
                        dec = 1;
                    }
                 }
                 if(rects[cellView.id])
                 {
                    var incoming = graph.getConnectedLinks(cellView, { outbound: true });        
                    if(incoming.length==1)
                    {
                        dec=1;
                    }
                 }
                 if (rects[click_id.id])
                 {
                    var outgoing = graph.getConnectedLinks(click_id, { inbound: true });        
                    if(outgoing.length==1)
                    {
                        dec = 1;
                    }
                 }
                 if(dec==1 || cellView.id==start.id)
                 {

                 }
                 /*if(cellView.id==start.id || dec == 1)
                 {
                    paper.$el.removeClass('connecting');
                    state=0;
                 }*/
                 else if(check_link(cellView.id,click_id.id) && (cellView.id!=StepImage.id &&cellView.id!=DStepImage.id && cellView.id!=DeleteImage.id))
                 {                    
                    var ln = new joint.dia.Link({
                        source: { id: cellView.id }, target: { id: click_id.id },
                        attrs: { '.marker-source': { d: 'M 10 0 L 0 5 L 10 10 z' } }
                    });
                    links.push([ln.id,cellView.id,click_id.id]);
                    graph.addCell([ln]);
                }
            }
            if(cellView.id!=StepImage.id)
            {
                //alert("Initial");
                if(parallel_outer[click_id.id])
                {
                    setColor(1,click_id);
                }
                else
                {
                    setColor(0,click_id);
                }
                if(parallel_outer[cellView.id])
                {
                    setColor(1,cellView);
                }
                else
                {
                    setColor(0,cellView);
                }
                paper.$el.removeClass('connecting');
                state=0;
            }
        }           
    }

    function ondrag_join (cellView,evt,x,y) {
        var elementBelow = graph.get('cells').find(function(cell) {
            if (cell instanceof joint.dia.Link) return false; // Not interested in links.
            if (cell.id === cellView.model.id) return false; // The same element as the dropped one.
            if (cell.getBBox().containsPoint(g.point(x, y))) {
                return true;
            }
            return false;
        });

        if (elementBelow && !_.contains(graph.getNeighbors(elementBelow), cellView.model)) {
        graph.addCell(new joint.dia.Link({
            source: { id: cellView.model.id }, target: { id: elementBelow.id },
            attrs: { '.marker-source': { d: 'M 10 0 L 0 5 L 10 10 z' } }
        }));
            // Move the element a bit to the side.
            cellView.model.translate(-200, 0);
        }
    }
    function add_rect(x_val,y_val){
        var rect = new joint.shapes.basic.Rect({
                position: { x: x_val, y: y_val },
                size: { width: 100, height: 30 },
                attrs: { rect: { fill: 'blue',rx: 15, ry: 15}, text: {} }
        });
        graph.addCells([rect]);
    }
    //$scope.draw_line =function  (){
    function draw_line(cell,x,y){
        var mo=graph.findModelsFromPoint(g.point(x,y));
        var all_el = graph.getElements();
       // alert('asdf');
        for (var i = 0; i < all_el.length; i++) {
            if(parallel_outer[all_el[i].id])
            {
                var emb = (all_el[i].get('embeds'));
                //alert(emb.length);
                var cnt=0;
                for (var j = 0; j <emb.length ;  j++) {
                    if(!vert[emb[j]] && mo[0].id==emb[j])
                    {
                        var cl=graph.getCell(emb[j]);
                        return cl;
                        //setColor(0,cl);
                        //cl.toFront();
                        //cnt++;
                    }
                };
//                alert(cnt);
            }
        };
        return 0;
    }

    var out_h,out_w;
    function outer_box(x_val,y_val,steps){
        out_h=8*rect_h;
        out_w = (parseInt(steps))*rect_w;
        //alert(parseInt(steps)+2);
        var rect = new joint.shapes.basic.Rect({
                position: { x: x_val, y: y_val },
                size: { width: out_w, height: out_h },
                // attrs: { rect: { rx: 15, ry: 15}, text: {} }
        });
        graph.addCells([rect]); 
        parallel_outer[rect.id]=1;
 
        for (var i = 0; i < (parseInt(steps)); i++) {
            /*xi=parseInt(x_val)+parseInt(rect_w)*parseInt(i);
            yi=y_val;
            hj=parseInt(out_h);*/
            var rect2 = new joint.shapes.basic.Rect({
                position: { x: parseInt(x_val)+parseInt(i)*parseInt(rect_w), y: y_val },
                size: { width: rect_w, height: out_h },
                attrs: { rect2: { fill: 'blue'}, text: {  } }
            });
            var ln = new joint.shapes.basic.Rect({
                position: { x: parseInt(x_val)+parseInt(i)*parseInt(rect_w), y: y_val },
                size: { width: 1, height: out_h },
                attrs: { ln : { fill: 'blue'}, text: {} }
            });
            //cnt+=1;
            rect.embed(rect2);
            rect.embed(ln);    
            graph.addCells([rect2,ln]);
            vert[ln.id]=1;
            parallel_inner[rect2.id]=1;
            rect2.toBack();    
            paper.findViewByModel(rect2).options.interactive = false; 
            paper.findViewByModel(ln).options.interactive = false; 
        };
        //cnt+=1;
    }
    function is_child(cellView){
        var all = graph.getElements();
        for (var i =0;i < all.length ; i++) {
            if(parallel_outer[all[i].id]==1)
            {
                var emb = (all[i].get('embeds'));
                for(var j=0 ;j<emb.length ;j++ )
                {
                    if(cellView.model.id==emb[j])
                    {
                        return 0;
                    }
                }
            }
        };
        return 1;
    }

    $scope.add_parallel = function (){
        var steps = $scope.parallel_steps;
        var st_x = 100;st_y=100;
        if(steps==0)
        {
            alert('Atleast one step is required!!!');
        }
        else
        {
            outer_box(st_x,st_y,steps);
        }
    }

    $scope.verify =function (){
        //Start step should have an outgoing link
        var inboundStart = graph.getConnectedLinks(start, { inbound: true });
        var outboundEnd = graph.getConnectedLinks(end, { outbound: true });
        var all_el = graph.getElements();
        var flag=0;
        for (var i = 0; i <all_el.length; i++) {
                if(rects[all_el[i].id])
                {
                    var incoming = graph.getConnectedLinks(all_el[i], { outbound: true });        
                    var outgoing = graph.getConnectedLinks(all_el[i], { inbound: true });        
                    if(!(incoming.length==1 && outgoing.length==1))
                    {
                        flag=1;
                        alert("Error from normal step!!!");
                        break;
                    }
                }
                else if(parallel_outer[all_el[i].id])
                {
                    var incoming = graph.getConnectedLinks(all_el[i], { outbound: true });        
                    var outgoing = graph.getConnectedLinks(all_el[i], { inbound: true });        
                    if(!(incoming.length==1 && outgoing.length==1))
                    {
                        flag=1;
                        alert("Error from parallel step!!!");
                        break;
                    }
                }
                else if(dsteps[all_el[i].id])
                {
                    var incoming = graph.getConnectedLinks(all_el[i], { outbound: true });        
                    var outgoing = graph.getConnectedLinks(all_el[i], { inbound: true });        
                    if(!(incoming.length==1 && outgoing.length==2))
                    {
                        flag=1;
                        alert("Error from decision step!!!");
                        break;
                    }
                }
        };
        if(flag==1)
        {
 
        }
        else if(inboundStart.length!=1)
        {
            alert("Error from start");
        }
        else if(outboundEnd.length==0)
        {
            alert("No link to end");
        }
        else
        {
            alert("No Error");
        }
    }
    //We can have pointerup but that will not be optimal
    paper.on('cell:pointerclick', function(cellView, evt, x, y) {

        var mo=graph.findModelsFromPoint(g.point(x,y));
        var ret;
        //alert(cellView.model.get('position').x);
        if(mo.length>1)
        {
            ret=mo[mo.length-1];        
        }
        else
        {
            ret=cellView.model;
        }
        if (ret)
        {
            if(!vert[ret.id])
            {
                onclick_join(ret,evt,x,y);
            }
        }
        else//Here we can join with the parent
        {
            paper.$el.removeClass('connecting');
            state = 0;
        }
    });
    paper.on('cell:pointerup',function(cellView, evt, x, y){
      
        if(cellView.model.id == StepImage.id)
        {
            //alert(state);
            if(state==1)
            {
                var mo=graph.findModelsFromPoint(g.point(pos_x,pos_y));
                //alert(mo.length);
                if(mo.length>1)
                {
                    var dmo = mo[0].get('embeds');
                    var mul = parseInt(2*rect_h)+parseInt(mo[0].get('position').y);
                    if(dmo)
                    {
                    //alert(dmo.length);
                        var ldmo;
                        if(dmo.length==1)
                        {
                            ldmo=2;
                        }
                        else{
                            ldmo=dmo.length+1;
                        }
                        mul=((parseInt(2*rect_h)*parseInt(ldmo))+parseInt(mo[0].get('position').y));
                    }
                    if(mul>(parseInt(6*rect_h)+parseInt(mo[0].get('position').y)))
                    {
                        var rect = new joint.shapes.basic.Rect({
                            position: { x: mo[0].get('position').x, y: 1600},
                            size: { width: 40, height: 10 },
                            attrs: { rect: { fill: 'blue',rx: 15, ry: 15}, text: {} }
                        });
                    }
                    else
                    {
                        var rect = new joint.shapes.basic.Rect({
                            position: { x: mo[0].get('position').x, y: mul},
                            size: { width: 100, height: 30 },
                            attrs: { rect: { fill: 'blue',rx: 15, ry: 15}, text: {text: 'Step' + cnt, fill: 'white'} }
                        });
                        cnt+=1;
                    }
                    mo[0].embed(rect);
                    graph.addCells([rect]);
                    rect.toFront();
                    paper.findViewByModel(rect).options.interactive = false;
                    paper.$el.removeClass('connecting');
                    state=0;
                    all_el = graph.getElements();
                    for (var i = 0; i <all_el.length; i++) {
                        if (parallel_outer[all_el[i].id]) 
                        {
                            setColor(1,all_el[i]);
                        }
                        else
                        {
                            setColor(0,all_el[i]);
                        }
                    }; 
                }
                else
                {
                    addProcess();
                }
                
            }
            else
            {
                addProcess();
            }   
        }
        if(cellView.model.id == DStepImage.id)
        {
            addDstep();
        }
        //state=0;
    });
    paper.on('blank:pointerclick', function(evt, x, y) {
            //If someone clicks on the black part then state will be reset 
            //alert("blank");
               all_el = graph.getElements();
               for (var i = 0; i <all_el.length; i++) {
                    if (parallel_outer[all_el[i].id]) 
                    {
                        setColor(1,all_el[i]);
                    }
                    else
                    {
                        setColor(0,all_el[i]);
                    }
                }; 
               paper.$el.removeClass('connecting');
               state=0;
    });

               
    var check;
    $scope.graph_to_json = function(){
        //Create json object for graph
        var json_object = graph.toJSON();
        check = json_object;
        $('#message').text(JSON.stringify(json_object));
    }
    function json_to_graph (json_object){
        var jsonString = JSON.stringify(json_object);
        graph.fromJSON(JSON.parse(jsonString));
    }
    $scope.load_graph = function(){
        json_to_graph(check);
    }
    $scope.get_rest = function(){
        $('#message').text(AngularIssues.query());
    }

}]);

angular.module('app.controller2', [])
  .controller('add_task', ['$scope','AngularIssues','AngularIssue','FormService' , function($scope  , AngularIssues , AngularIssue , FormService) {
    $scope.as= "asd";
    $scope.types = AngularIssues.query();

    //Define model for the dropdown
    $scope.myColor = $scope.types[0];
    $scope.task_type = "Form";
    $scope.show_type = FormService.query();
    $scope.myshow_type = $scope.show_type[0];


    $scope.show_list = function(){
        $scope.result = AngularIssues.query();
    }

    $scope.show_single = function(){
        var single = AngularIssue.query(function(){
                    $scope.result2 = single[0].m_name;         
        });
        
    }

    $scope.add_task = function(){

    }

    $scope.add_one = function(){
        var single = AngularIssue.query(function(){

                var value = single[0];
                value.m_name = "Ashish";
                value.$save();
        });
    }
}]);