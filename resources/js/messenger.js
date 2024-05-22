
/**
 * --------------------------------
 * Reusable Functions
 * --------------------------------
 */

function imagePreview(input, selector) {
    if(input.files && input.files[0]) {
        var render = new FileReader();

        render.onload = function(e) {
            $(selector).attr('src', e.target.result);
        }

        render.readAsDataURL(input.files[0]);
    }
}

function searchUsers(query) {
    $.ajax({
        method: 'GET',
        url: "/messenger/search-user",
        data: {searchString: query},
        success: function(reposnse) {
            $('.user_search_list_result').html(reposnse.records);
        },
        error: function(xhr, status, err) {
            console.log(err);
        }
    })
}

/**
 * --------------------------------
 * On Dom Load
 * --------------------------------
 */

$(document).ready(function() {

    $('#select_file').on('change', function() {
        imagePreview(this, '.profile_image_preview');
    })

    $('.user_search').on('keyup', function() {
        let query = $(this).val();
        searchUsers(query);
    })

});
