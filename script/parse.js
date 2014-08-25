$(function(){
	
	//REQUIRED
	var parseApplicationId = ""
	var parseJavascriptKey = ""
	var parseObjectName = ""
	
	// UNCOMMENT FOR TEST SAMPLE...
	// var parseApplicationId = "honEIteZ5FGjJQie8lizH32XBp9pF9AagskeZaaH"
	// var parseJavascriptKey = "0WZBdubyhvLXs5F0AdTnreqkAQIDNPYhqk9lDO2s"
	// var parseObjectName = "JokeObject"
	
	if (parseApplicationId.length == 0) {
		alert('Please set Application ID in the code.')
		return
	
	} else if (parseJavascriptKey.length == 0) {
		alert('Please set Javascript Key in the code.')
		return
		
	} else if (parseObjectName.length == 0) {
		alert('Please set Parse Object name')
		return
	}
	
	//ADJUSTABLE PARAMETER
	var objectsPerPage = 20
	//Comma delimited fetch object list
	var fetchList = [] //['isbn', 'name']
	
	
	
	
	
	//======= CODE STARTS =======
	
	Parse.initialize(parseApplicationId, parseJavascriptKey)
	var ParseObject = Parse.Object.extend(parseObjectName)
	
	var query = new Parse.Query(ParseObject)
	var currentPage = 1
	var resultObjects = []
	var totalPages, currentIndex, keys
	var isEditPanelLoaded = false
	
	var $menuTable = $('#menu_table')
	var $editTable = $('#edit_table')
	
	function fetchForPage(page) {
		query.skip((page - 1) * objectsPerPage)
		query.limit(objectsPerPage)
		//query.select('isbn', 'name')
		//console.log('Fetch list: ' + fetchList + ' Count: ' + fetchList.length)
		if (fetchList.length > 0) {
			query.select(fetchList)
		}
		query.find({
			success: function(results) {
				//alert("Successfully retrieved " + results.length + " scores.")
				
				resultObjects = results
				//$.merge(resultObjects, results)
				
				if (results.length > 0) {
					var sampleObject = results[0]
					currentIndex = 0
					
					//This is to generate the keys for table header
					keys = Object.keys(sampleObject.attributes);
					
					//MENU TABLE
					var menuTableHeader = '<tr><th>ID</th>'
					for (var i = 0; i < keys.length; i++) {
						var key = keys[i]
						menuTableHeader += ('<th>' + key + '</th>')	
					}
					menuTableHeader += '<th>Created At</th></tr>'
					$menuTable.last().append(menuTableHeader)
					
					
					//EDIT TABLE
					if (isEditPanelLoaded == false) {
						
						var editTableElements = 
						'<tr><td>ID</td><td><input type="text" name="object_id" value=' + sampleObject.id +' readonly></input></td>'
						
						var selectOptions = ""
						for (var i = 0; i < keys.length; i++) {
							var key = keys[i]
							
							var element = sampleObject.attributes[key]
							if ((typeof element) == 'string') {
								//console.log('TYPE STRING')
								editTableElements += '<tr><td>' 
								+ key 
								+ '</td><td><textarea rows="5" cols="20" name="' 
								+ key 
								+ '">' 
								+ element 
								+ '</textarea></td></tr>'
								
							} else if ((typeof element) == 'number') {
								//console.log('TYPE NUMBER')
								editTableElements += '<tr><td>' 
								+ key 
								+ '</td><td><input type="number" name="' 
								+ key 
								+ '" value=' 
								+ element 
								+ '></input></td></tr>'
							}
							
							selectOptions += '<option>' + key + '</option>'
						}
						
						//EDIT TABLE
						editTableElements += ('<tr><td>Created At</td><td><input type="text" name="created_at" value="' + sampleObject.createdAt +'" readonly></input></td></tr>')
						$editTable.last().append(editTableElements)
						$('#search_select').append(selectOptions)
					}
					
					//Set to first loaded flag to true
					isEditPanelLoaded = true
				}
				
				
				//Append data received from server
				for (var i = 0; i < results.length; i++) {
					var object = results[i];
					var createdAt = $.format.date(object.createdAt, "hh:mm:ss p MM/dd/yyyy")
					var objectRow = '<tr class="menu_row"><td>' + object.id + '</td>'
					
					for (var j = 0; j < keys.length; j++) {
						var key = keys[j]
						var value = object.attributes[key]
						
						//Trim the string when it's too long
						if ((typeof value) == 'string') {
							//console.log('String: ' + value + 'Length: ' + value.length)
							if (value.length > 30) {
								value = jQuery.trim(value).substring(0, 30).split(" ").slice(0, -1).join(" ") + "..."
							}
						}
						objectRow += '<td>' + value + '</td>'
					}
					
					objectRow += '<td>' + createdAt + '</td></tr>'
					
					$menuTable.last().append(objectRow)
				}
			},
			error: function(error) {
				//alert("Error: " + error.code + " " + error.message)
			}
		})
	}
	
	query.count({
		success: function(count) {
			
			totalPages = Math.floor(count / objectsPerPage) + 1
			$('#total_pages').html(totalPages)
			// The count request succeeded. Show the count
			//alert("Total " + count + " objects");
		  },
		  error: function(error) {
			// The request failed
		  }
	})
	
	function goToPage(pageNumber) {
		if (pageNumber != currentPage) {
			if (pageNumber > totalPages) {
				alert('Page number entered ('+ pageNumber +') cannot exceed total number of pages (' + totalPages + ')')
				
			} else if (pageNumber == 0) {
				alert('Target page cannot be 0')
			
			} else {
				currentPage = pageNumber
				reloadMenuTable()
			}
			$('#page_setter').val(currentPage)
		}
	}
	
	
	function reloadMenuTable() {
		$menuTable.empty();
		fetchForPage(currentPage)
	}
	
	
	function resetEditTable() {
		
		if (resultObjects.length > 0) {
			var object = resultObjects[0]
			$('[name=object_id]').val("")
			$('[name=created_at]').val("")
			
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i]
				var element = object.attributes[key]
				if ((typeof element) == 'number') {
					$('[name=' + key + ']').val(0)
					
				} else if ((typeof element) == 'string') {
					$('[name=' + key + ']').val("")
				}
			}
		}
	}
	
	
	//Fetch for page
	fetchForPage(currentPage)
	
	
	//Update button handler
	$('#update_button').click(function() {
		
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i]
			var currentObject = resultObjects[currentIndex]
			var element = currentObject.attributes[key]
			
			var value = $('[name=' + key + ']').val()
			if ((typeof element) == 'number') {
				value = parseInt(value, 10)
			} 
			
			//console.log('Key: ' + key + 'Element: ' + $('[name=' + key + ']').val())	
			
			currentObject.set(key, value)
		}
		currentObject.save()
		
		//alert('Object ' + currentObject.id + ' saved')
	})
	
	$('#delete_button').click(function() {
		
		var shouldDelete = confirm('Do you want to continue deleting this object?')
		
		if (shouldDelete == true) {
			var currentObject = resultObjects[currentIndex]
			currentObject.destroy({
			  success: function(myObject) {
				  
				  alert(myObject.id + ' is deleted')
				  //Refetch everything
				  reloadMenuTable()
				  resetEditTable()
			  },
			  error: function(myObject, error) {
				  alert(myObject.id + ' deletion failed. Error: ' + error)
			  }
			});
		}
	})
	
	
	//New button handler
	$('#new_button').click(function() {
		if (resultObjects.length > 0) {
			var object = resultObjects[0]
			$('[name=object_id]').closest('tr').hide()
			$('[name=created_at]').closest('tr').hide()
			
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i]
				var element = object.attributes[key]
				if ((typeof element) == 'number') {
					$('[name=' + key + ']').val(0)
					
				} else if ((typeof element) == 'string') {
					$('[name=' + key + ']').val("")
				}
			}
			
			$('#save_button').show()
			$('#edit_buttons').hide()
		}
	})
	
	
	//Save Button Handler
	$('#save_button').click(function() {
		
		var parseObject = new ParseObject()
		
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i]
			var currentObject = resultObjects[currentIndex]
			var element = currentObject.attributes[key]
			
			var value = $('[name=' + key + ']').val()
			if ((typeof element) == 'number') {
				value = parseInt(value, 10)
			}
			parseObject.set(key, value)
		}
		
		parseObject.save(null, {
			  success: function(gameScore) {
				// Execute any logic that should take place after the object is saved.
				alert('New object created with objectId: ' + gameScore.id);
			  },
			  error: function(gameScore, error) {
				alert('Failed to create new object, with error code: ' + error.message);
  			  }
		});
	})
	
	
	$('#go_page_button').click(function() {
		var enteredPage = $('#page_setter').val()
		goToPage(enteredPage)
	})
	
	
	$('#prev_button').click(function() {
		goToPage(currentPage-1)
	})
	
	
	$('#next_button').click(function() {
		goToPage(currentPage+1)
	})
	
	
	//Update the right hand side of the panel when user tapped on left hand side
	$('body').on('click', 'tr.menu_row', function() {
		
		//Since there is TR on top, the index should -1
		var selectedIndex = $(this).index() - 1
		//console.log('Index: ' + selectedIndex)
		
		$('[name=object_id]').closest('tr').show()
		$('[name=created_at]').closest('tr').show()
		$('#save_button').hide()
		$('#edit_buttons').show()
		
		
		var object = resultObjects[selectedIndex]
		
		$('[name=object_id]').val(object.id)
		$('[name=created_at]').val(object.createdAt)
		
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i]
			var element = object.attributes[key]
			$('[name=' + key + ']').val(element)
		}
		currentIndex = selectedIndex
	});
	
	//UI
	$('button').button()
	
})