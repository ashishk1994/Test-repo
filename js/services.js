
angular.module('app.services', ['ngResource'])
    

   .factory('AngularIssues', function($resource){
	     return $resource('../test.json',{},{
         query: {
                    isArray: true,
                    method:'GET'
                }}
       )
   })
//   .value('version', '0.1');