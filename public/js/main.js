$(document).ready(function(){
  $('.del-article').on('click',function(e){

    $target=$(e.target);
    let del_id =$target.attr('data-id');
    // console.log(del_id);
    $.ajax({
      url:'/article/delete/'+del_id,
      type:'DELETE',
      success:function(response){
        alert('Deleting Article');
        // redirect
        window.location.href='/';
      },
      error:function(err){
        console.log(err);
      }
    });
  })
});
