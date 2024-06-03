
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

let searchPage = 1;
let noMoreDataSearch = false;
let searchTempVal = "";
let searchLoading = false;
function searchUsers(query) {

    if(query != searchTempVal) {
        searchPage = 1;
        noMoreDataSearch = false;
    }
    searchTempVal = query;

    if(!searchLoading && !noMoreDataSearch) {
        $.ajax({
            method: 'GET',
            url: "/messenger/search-user",
            data: {searchString: query, page: searchPage},
            beforeSend: function() {
                $('.user_search_list_result').append(`<div class="text-center search-loader">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                    </div>
                </div>`);

                searchLoading = true;

                $('.user_search_list_result').find('.nothing_found-text').remove();
            },
            success: function(reposnse) {

                if(searchPage < 2) {
                    $('.user_search_list_result').html(reposnse.records);
                }
                else {
                    $('.user_search_list_result').append(reposnse.records);
                }

                noMoreDataSearch = searchPage >= reposnse?.lastPage;

                if(!noMoreDataSearch) {
                    searchPage++;
                }
            },
            error: function(xhr, status, err) {
                console.log(err);
            },
            complete: function() {
                $('.user_search_list_result').find('.search-loader').remove();
                searchLoading = false;
            }
        })
    }
}

function debounce(callback, delay) {
    let timerId;
    return function(...args) {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            callback.apply(this, args);
        }, delay)
    }
}

function actionOnScroll(selector, callback, topScroll = false) {
    $(selector).on('scroll', function() {
        let element = $(this).get(0);
        const condition = topScroll ? element.scrollTop == 0 :
        element.scrollTop + element.clientHeight >= element.scrollHeight;

        if(condition) {
            callback();
        }
    })
}

/**
 * --------------------------------
 * Fetch id data of user and update view
 * --------------------------------
 */

function IDinfo(id) {
    $.ajax({
        method: 'GET',
        url: '/messenger/id-info',
        data: {id: id},
        success: function(response) {
            $('.messenger-header').find('img').attr('src', response.user.avatar);
            $('.messenger-header').find('h4').text(response.user.name);

            $('.messenger-info-sidebar .user_photo').find('img').attr('src', response.user.avatar);
            $('.messenger-info-sidebar').find('.user_name').text(response.user.name);
            $('.messenger-info-sidebar').find('.user_unique_name').text(response.user.username);
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

    // search user
    const debouncedSearch = debounce(function() {
        const value = $('.user_search').val();
        searchUsers(value);
    }, 500);
    $('.user_search').on('keyup', function() {
        let query = $(this).val();
        if(query.length > 0) {
            debouncedSearch();
        }
    })

    // search pagination
    actionOnScroll(".user_search_list_result", function() {
        let value = $('.user_search').val();
        searchUsers(value);
    })

    // click action on messenger list item
    $('body').on('click', '.messenger-list-item', function() {
        const id = $(this).data('id');
        IDinfo(id);
    })

});
