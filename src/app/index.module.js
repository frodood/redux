!function(){function o(){var o=window.location.protocol+"//"+window.location.hostname;return(-1!==o.indexOf("localhost")||-1!==o.indexOf("127.0.0.1"))&&(o=window.location.protocol+"//geomsolutions.developer.12thdoor.com"),o}var n=angular.injector(["ng"]).get("$http"),a=JSON.parse(decodeURIComponent(function(o){var n=("; "+document.cookie).split("; "+o+"=");return 2===n.length?n.pop().split(";").shift():void 0}("authData")));(window.prmMatrix,window.dependantModules=["app.core","app.navigation","app.toolbar","app.profile","app.dashboard","app.planupgrade","app.utils","app.playground"],n.get(o()+"/apis/permission/getrole/"+a.Email).then(function(o){o=o.data,window.prmMatrix=o;for(var n=0;n<o.appPermission.length;n++){var a="app."+o.appPermission[n].appName.toLowerCase();o.appPermission[n].view&&"app.360view"!==a?"app.dashboard"!==a&&window.dependantModules.push(a):window.dependantModules.push("app.threesixtyview")}},function(o){console.log(o)})).then(function(){angular.element(document).ready(function(){angular.bootstrap(document,["12thDoor"])})})}();
  
(function ()
{
    'use strict';

    angular
        .module('12thDoor', dependantModules);

})();

