    angular.module('app.controllers', [])
      .controller('editor', ['$scope' ,'AngularIssues', function($scope , AngularIssues ) {

        var graph = new joint.dia.Graph;

        var paper = new joint.dia.Paper({
            el: $('#myholder'),
            width: 1500,
            height:500,
            model: graph
        });
        var rects=[];
        var texts=[];
        var cnt = 0;
        var dsteps = [];
        var dcnt = 0;
        var start = new joint.shapes.basic.Circle({
            position:{ x:400,y:50},
            attrs:{circle:{fill:'black'}, text : {text:'Start',fill:'white'}}
        });
        var end = new joint.shapes.basic.Circle({
            position:{ x:600,y:400},
            attrs:{circle:{fill:'black'}, text : {text:'End',fill:'white'}}
        });
        graph.addCells([start,end]);

        $scope.addDstep = function() {
            dcnt+=1;
            var rect = new joint.shapes.basic.Path({
                size: { width: 50, height: 50 },
                attrs: {
                    path: { d: 'M 30 0 L 60 30 30 60 0 30 z' ,fill : 'green'},
                    text: {
                        text: 'D' + dcnt,
                        'ref-y': .5 // basic.Path text is originally positioned under the element
                    }
                }
            });
            dsteps.push(rect);
            graph.addCells([rect]);
        };

        $scope.addProcess = function() {
                cnt+=1;
                var rect = new joint.shapes.basic.Rect({
                    position: { x: 100, y: 30 },
                    size: { width: 100, height: 30 },
                    attrs: { rect: { fill: 'blue',rx: 15, ry: 15}, text: { text: 'Step' + cnt, fill: 'white' } }
                });
                rects.push(rect);
                graph.addCells([rect]);
        };
        
        $scope.joinProcess = function() {
            var link = new joint.dia.Link({
                source: { id: rects[$scope.process1].id },
                target: { id: rects[$scope.process2].id }
            });
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

        function onclick_join(cellView,ect,x,y) {
                     if(state==0)
                    {
                        //$('#message').text(cellView.model.id);
                        click_id=cellView.model.id;
                        state=1;
                    }
                    else
                    {
                        //$('#message').text(cellView.model.id);
                        if(cellView.model.id!=click_id )//&& cellView instanceof joint.shapes.basic)
                        {
                                 graph.addCell(new joint.dia.Link({
                                    source: { id: cellView.model.id }, target: { id: click_id },
                                    attrs: { '.marker-source': { d: 'M 10 0 L 0 5 L 10 10 z' } }
                                }));
                        }
                        state=0;
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
        
        paper.on('cell:pointerup', function(cellView, evt, x, y) {
                    onclick_join(cellView,evt,x,y);
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