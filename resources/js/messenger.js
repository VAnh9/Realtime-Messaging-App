
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

/**
 * --------------------------------
 * On Dom Load
 * --------------------------------
 */

$(document).ready(function() {

    $('#select_file').on('change', function() {
        imagePreview(this, '.profile_image_preview');
    })

});
