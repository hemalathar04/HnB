hbiApp.controller('basketController', ['$scope','$http','basketService','headerService','productlistService','$state',  function($scope, $http,basketService,headerService,productlistService,$state) {
	
	$scope.init = function(){ 
		console.log("basket");
		$scope.basketItems();
	}
    
	$scope.basketItems = function() { 
	    
	    //var cartId = '2ead088f-2f7b-4493-bbdd-968e0a6724eb';
		var cart = headerService.sessionGet('cart');
		console.log("calling get cart service:"+cart);
		var cartId = cart.id;
		$scope.cartVersion = cart.version;
        console.log("calling get cartid service:"+cartId);
		
		basketService.getBasketDetails(cartId).then(function(response, status, headers, config) {  
		   console.log("response:"+response.data);
		   
           $scope.masterDataObj = response.data;
           console.log($scope.masterDataObj);
		   $scope.cartVersion = $scope.masterDataObj.version;
		   cart.version = $scope.masterDataObj.version;;
		   headerService.sessionSet('cart',cart);
           $scope.setBasketData(response.data);
           $scope.recommendedProducts();
		}).catch(function(response, status, headers, config) {
		   console.log(response);	  
		})
	}
	
	$scope.gotoCheckout = function(){ 
		console.log("gotoCheckout");
		$state.go("checkout");	
	}
	
	$scope.setBasketData = function(basketObj) { 
		if (basketObj != null) {
			$scope.lineitems = [];
			var i=0;
			angular.forEach(basketObj.lineItems, function(lineItemData){
				$scope.lineItem = {};
				$scope.lineItem.productId = lineItemData.productId;
				$scope.lineItem.productNameEn = lineItemData.name.en;
				$scope.lineItem.productNameSv = lineItemData.name.sv;
				$scope.lineItem.quantity = lineItemData.quantity;
				$scope.lineItem.image=lineItemData.variant.images[0].url;
				console.log("$scope.lineItem.image:"+$scope.lineItem.image);
				$scope.lineItem.priceAmt = lineItemData.totalPrice.centAmount;
				if(lineItemData.totalPrice.fractionDigits != null){
					$scope.lineItem.priceAmt = $scope.lineItem.priceAmt/ (Math.pow(10,lineItemData.totalPrice.fractionDigits));
				}
				$scope.lineItem.currencyCode = '£';
				if(lineItemData.totalPrice.currencyCode == 'GBP')
				{
					$scope.lineItem.currencyCode = '£';
				}
				$scope.lineitems[i]=$scope.lineItem;
				i++;
			});
		
			$scope.totalGrossCurrency = '£';
			if(basketObj.totalPrice.currencyCode == 'GBP'){
				$scope.totalGrossCurrency = '£';
			}
			$scope.totalGrossAmt = basketObj.totalPrice.centAmount;
			if(basketObj.totalPrice.fractionDigits != null){
				$scope.totalGrossAmt = $scope.totalGrossAmt/ (Math.pow(10,basketObj.totalPrice.fractionDigits));
			}
			$scope.subTotalAmt=$scope.totalGrossAmt;
			$scope.savingsAmt=0;
			
		}
		
	}
	
	$scope.addDiscount = function(cartDiscountCode) {
		var cart = headerService.sessionGet('cart');
		console.log("calling get cart service:"+cart);
		var cartId = cart.id;
		$scope.cartVersion = cart.version;
		var data={};
		data.version = cart.version;
		data.actions=[];
		var actionDetails={};
		actionDetails.action="addDiscountCode";
		actionDetails.code=cartDiscountCode;
		data.actions[0]=actionDetails;
		basketService.addDiscount(cartId, data)  // add discount
		.then(function(response) {
			$scope.masterDataObj = response.data;
           console.log($scope.masterDataObj);
		   $scope.cartVersion = $scope.masterDataObj.version;
		   cart.version = $scope.masterDataObj.version;
		   headerService.sessionSet('cart',cart);
           $scope.setBasketData(response.data);
           $scope.recommendedProducts();
			
		});
	}
	
	$scope.recommendedProducts = function() {
		var categoryId = headerService.sessionGet('categoryId');
		productlistService.getProducts(categoryId)  // get all products based on category
		.then(function(response) {
			$scope.products = response.data.results;
			console.log("$scope.products");
			console.log($scope.products);
		});
	}
	
}]);