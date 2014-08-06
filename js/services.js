
angular.module('app.services', ['ngResource'])
    

   .factory('AngularIssues', function($resource){
	     return $resource('mocks/data.json/:id',{id:'@m_id'});

   })
angular.module('app.service2', ['ngResource'])

   .factory('AngularIssue', function($resource){
	     return $resource('mocks/single.json/:id',{id:'@m_id'});

   })
angular.module('app.service3', ['ngResource'])

   .factory('FormService', function($resource){
	     return $resource('mocks/form.json/:id',{id:'@m_id'});

   })

//   .value('version', '0.1');