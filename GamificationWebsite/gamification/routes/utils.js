var mergeSort2D = function(unsortedArray) {
  //console.log(indexForSorting);
  var indexForSorting = 1;
  // No need to sort the array if the array only has one element or empty
  if (unsortedArray.length <= 1) {
    return unsortedArray;
  }
  // In order to divide the array in half, we need to figure out the middle
  const middle = Math.floor(unsortedArray.length / 2);

  // This is where we will be dividing the array into left and right
  const left = unsortedArray.slice(0, middle);
  const right = unsortedArray.slice(middle);

  // Using recursion to combine the left and right
  return merge(
    mergeSort2D(left), mergeSort2D(right), indexForSorting
  );
}

var mergeSort2DOnFirst = function(unsortedArray) {
  //console.log(indexForSorting);
  var indexForSorting = 0;
  // No need to sort the array if the array only has one element or empty
  if (unsortedArray.length <= 1) {
    return unsortedArray;
  }
  // In order to divide the array in half, we need to figure out the middle
  const middle = Math.floor(unsortedArray.length / 2);

  // This is where we will be dividing the array into left and right
  const left = unsortedArray.slice(0, middle);
  const right = unsortedArray.slice(middle);

  // Using recursion to combine the left and right
  return merge(
    mergeSort2DOnFirst(left), mergeSort2DOnFirst(right), indexForSorting
  );
}

// Merge the two arrays: left and right
function merge (left, right, indexFor2D) {
  let resultArray = [], leftIndex = 0, rightIndex = 0;

  // We will concatenate values into the resultArray in order
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex][indexFor2D] < right[rightIndex][indexFor2D]) {
      resultArray.push(left[leftIndex]);
      leftIndex++; // move left array cursor
    } else {
      resultArray.push(right[rightIndex]);
      rightIndex++; // move right array cursor
    }
  }

  // We need to concat here because there will be one element remaining
  // from either left OR the right
  return resultArray
          .concat(left.slice(leftIndex))
          .concat(right.slice(rightIndex));
}

function calculateConsistencyOverLast3(sprints){

  var sprintNames = [];
  var sprintCompletedVelocity = [];
  var sprintCommittedVelocity = [];

  for(var i = 0; i < sprints.length; i++){
      var sprintName = sprints[i]._id.ID;
      var sprintStatus = sprints[i]._id.Status;
      var sprintVelocity = sprints[i].velocity;
      var index = sprintNames.indexOf(sprintName);

      if(index === -1){
          sprintNames.push(sprintName);
          if(sprintStatus === "Done"){
              sprintCompletedVelocity.push(sprintVelocity);
              sprintCommittedVelocity.push(0);
          }else{
              sprintCompletedVelocity.push(0);
              sprintCommittedVelocity.push(sprintVelocity);
          }
      }else{
          if(sprintStatus === "Done"){
              sprintCompletedVelocity[index] = sprintVelocity;
          }else{
              sprintCommittedVelocity[index] = sprintVelocity;
          }
      }
  }

  var totCommitted = 0;
  var totCompleted = 0;
  var l = 0;
  for(var j = 0; j < 3 ; j++){

      if((j < sprintCommittedVelocity.length)){
          if((sprintCommittedVelocity[sprintCommittedVelocity.length - j -1] > 0)){
              totCompleted += sprintCompletedVelocity[sprintCompletedVelocity.length - j -1];
              totCommitted += sprintCommittedVelocity[sprintCommittedVelocity.length - j -1];
              l++;
          }
      } 
  }

  if(totCommitted > 0){
      return (totCompleted/totCommitted)*100;
  }

  return 0;
}



module.exports.mergesort = mergeSort2D;
module.exports.mergeSort2DOnFirst = mergeSort2DOnFirst;
module.exports.calculateConsistencyOverLast3Sprints = calculateConsistencyOverLast3;