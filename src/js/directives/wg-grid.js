/// <reference path="../../../typings/angularjs/angular.d.ts"/>

(function () {  
  angular.module('widgetGrid').controller('wgGridController', ['$element', '$scope', '$timeout', 'Grid', 'gridRenderer', function ($element, $scope, $timeout, Grid, gridRenderer) {
    var vm = this;
    
    var gridOptions = {
      columns: $scope.columns,
      rows: $scope.rows
    };
    vm.grid = new Grid(gridOptions);
    vm.rendering = null;
    vm.highlight = null;
    
    vm.addWidget = addWidget;
    vm.removeWidget = removeWidget;
    vm.updateGridSize = updateGridSize;
    vm.updateRendering = updateRendering;
    vm.getPositions = getPositions;
    vm.rasterizeCoords = rasterizeCoords;
    vm.updateWidget = updateWidget;
    vm.getWidgetRenderPosition = getWidgetPosition;
    vm.getWidgetStyle = getWidgetStyle;
    vm.isPositionObstructed = isObstructed;
    vm.isAreaObstructed = isAreaObstructed;
    vm.highlightArea = highlightArea;
    vm.resetHighlights = resetHighlights;
    
    $scope.$watch('columns', updateGridSize);
    $scope.$watch('rows', updateGridSize);
    
    updateRendering();
    
    function addWidget(widget) {
      vm.grid.add(widget);
      updateRendering();
    }
    
    function removeWidget(widget) {
      vm.grid.remove(widget);
      updateRendering();
    }
    
    function updateGridSize() {
      var columns = parseInt($scope.columns);
      var rows = parseInt($scope.rows);
      if (vm.grid.columns !== columns || vm.grid.rows !== rows) {
        vm.grid.resize(rows, columns);
        updateRendering();
        resetHighlights();
      }
    }
    
    function updateRendering() {
      vm.rendering = gridRenderer.render(vm.grid);
      $scope.$broadcast('rendering-finished');
    }
    
    function updateWidget(widget) {
        vm.rendering.setWidgetPosition(widget.id, widget.getPosition());
    }
    
    function getWidgetPosition(widget) {
      return vm.rendering.getWidgetPosition(widget.id);
    }
    
    function getWidgetStyle(widget) {
      return vm.rendering.getStyle(widget.id);
    }
    
    function getPositions() {
      var gridContainer = $element[0];

      // c.f. jQuery#offset: https://github.com/jquery/jquery/blob/2d715940b9b6fdeed005cd006c8bf63951cf7fb2/src/offset.js#L93-105
      var rect = gridContainer.getBoundingClientRect();
      if (rect.width || rect.height || gridContainer.getClientRects().length) {
        var doc = gridContainer.ownerDocument;
        var docElem = doc.documentElement;
        return {
          top: rect.top + window.pageYOffset - docElem.clientTop,
          left: rect.left + window.pageXOffset - docElem.clientLeft,
          height: rect.height,
          width: rect.width
        };
      }
      return { top: 0, left: 0, height: 0, width: 0 };
    }
    
    function isObstructed(i, j, options) {
      return vm.rendering ? vm.rendering.isObstructed(i, j, options) : true;
    }
    
    function isAreaObstructed(area, options) {
      return vm.rendering ? vm.rendering.isAreaObstructed(area, options) : true;
    }
    
    function rasterizeCoords(x, y) {
      return vm.rendering.rasterizeCoords(x, y, $element[0].clientWidth, $element[0].clientHeight);
    }
    
    function highlightArea(area) {
      if (area.top && area.left && area.height && area.width) {
        $timeout(function () {
          vm.highlight = area;
        });
      }
    }
    
    function resetHighlights() {
      $timeout(function () {
        vm.highlight = null;
      });
    }
  }]);
  
  angular.module('widgetGrid').directive('wgGrid', gridDirective);
  function gridDirective() {
    return {
      scope: {
        'columns': '@',
        'rows': '@',
        'showGrid': '@?',
        'highlightNextPos': '@?'
      },
      restrict: 'AE',
      controller: 'wgGridController',
      controllerAs: 'gridCtrl',
      transclude: true,
      replace: true,
      templateUrl: 'wg-grid'
    };
  }
})();
