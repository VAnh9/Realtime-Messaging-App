/**
 * --------------------------------
 * Global Variables
 * --------------------------------
 */

var tempMsgId = 0;

const getMessengerId = () => $("meta[name=id]").attr("content");
const setMessengerId = (id) => $("meta[name=id]").attr("content", id);
const csrf_token = $("meta[name=csrf_token]").attr("content");
const msgBoxContainer = $(".wsus__chat_area_body");

const sendMsgForm = $('.send_message_form');
const messageInput = $('.message_input');

/**
 * --------------------------------
 * Reusable Functions
 * --------------------------------
 */

function enableChatboxOverlay() {
    $('.wsus__message_paceholder').removeClass('d-none');
}

function disableChatboxOverlay() {
    $('.wsus__message_paceholder').addClass('d-none');
    $('.wsus__message_paceholder_blank').addClass('d-none');
}

function imagePreview(input, selector) {
    if(input.files && input.files[0]) {
        var render = new FileReader();

        render.onload = function(e) {
            $(selector).attr('src', e.target.result);
        }

        render.readAsDataURL(input.files[0]);
    }
}

// reset message form
function messageResetForm() {
    $('.attachement_block').addClass('d-none');
    sendMsgForm.trigger("reset");
    $(".emojionearea-editor").text('');
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
 * Slide to bottom on action
 * --------------------------------
 */
function scrollToBottom(container) {
    container.stop().animate({
        scrollTop: container[0].scrollHeight
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
        beforeSend: function() {
            NProgress.start();
            enableChatboxOverlay();
        },
        success: function(response) {
            // fetch messages
            fetchMessages(response.user.id, true);
            $('.messenger-header').find('img').attr('src', response.user.avatar);
            $('.messenger-header').find('h4').text(response.user.name);

            $('.messenger-info-sidebar .user_photo').find('img').attr('src', response.user.avatar);
            $('.messenger-info-sidebar').find('.user_name').text(response.user.name);
            $('.messenger-info-sidebar').find('.user_unique_name').text(response.user.username);
        },
        error: function(xhr, status, err) {
            console.log(err);
        },
        complete: function() {
            NProgress.done();
            disableChatboxOverlay();
        }
    })
}

/**
 * --------------------------------
 * Send Message
 * --------------------------------
 */

function sendMessage() {
    tempMsgId += 1;
    let tempId = `temp_${tempMsgId}`;
    let hasAttachment = !!$('.attachment_input').val();
    const inputValue = messageInput.val();

    if(inputValue.length > 0 || hasAttachment) {
        const formData = new FormData($(".send_message_form")[0]);
        formData.append("id", getMessengerId());
        formData.append("tempMsgId", tempId);
        formData.append("_token", csrf_token);
        $.ajax({
            method: "POST",
            url: "/messenger/send-message",
            data: formData,
            dataType: "JSON",
            processData: false,
            contentType: false,
            beforeSend: function() {
                // add temp message on dom
                if(hasAttachment) {
                    msgBoxContainer.append(sendTempMsgCard(inputValue, tempId, true));
                } else {
                    msgBoxContainer.append(sendTempMsgCard(inputValue, tempId));
                }
                scrollToBottom(msgBoxContainer);
                messageResetForm();
            },
            success: function(response) {
                const tempMsgCardElement = msgBoxContainer.find(`.message-card[data-id=${response.tempId}]`);
                tempMsgCardElement.before(response.message);
                tempMsgCardElement.remove();
            },
            error: function(xhr, status, err) {
                console.log(err);
            }
        })
    }
}

function sendTempMsgCard(message, tempId, attachement = false) {

    if(attachement) {
        return `
                <div class="wsus__single_chat_area message-card" data-id="${tempId}">
                    <div class="wsus__single_chat chat_right">
                        <div class="pre_loader">
                            <div class="spinner-border text-light" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        ${message.length > 0 ? `<p class="messages">${message}</p>` : ''}
                        <span class="clock far fa-clock"> Now</span>
                        <a class="action" href="#"><i class="fas fa-trash"></i></a>
                    </div>
                </div>
                `
    } else {
        return `
            <div class="wsus__single_chat_area message-card" data-id="${tempId}">
                <div class="wsus__single_chat chat_right">
                    <p class="messages">${message}</p>
                    <span class="clock far fa-clock"> Now</span>
                    <a class="action" href="#"><i class="fas fa-trash"></i></a>
                </div>
            </div>
        `
    }

}

/**
 * --------------------------------
 * Fetch Message From db
 * --------------------------------
 */
let messagePage = 1;
let noMoreMessages = false;
let msgLoading = false;
function fetchMessages(id, newFetch = false) {
    if (newFetch) {
        messagePage = 1;
        noMoreMessages = false;
    }
    if (!noMoreMessages) {
        $.ajax({
            method: 'GET',
            url: 'messenger/fetch-messages',
            data: {
                _token: csrf_token,
                id: id,
                page: messagePage
            },
            success: function(response) {
                if (messagePage == 1) {
                    msgBoxContainer.html(response.messages);
                    scrollToBottom(msgBoxContainer);
                } else {
                    msgBoxContainer.prepend(response.messages);
                }
                // pagination lock and page increment
                noMoreMessages = messagePage >= data?.lastPage;
                if(!noMoreMessages) {
                    messagePage++;
                }
            },
            error: function(err) {
                console.log(err);
            }
        })
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
        setMessengerId(id);
        IDinfo(id);
    })

    // Send Message
    $('.send_message_form').on('submit', function(e) {
        e.preventDefault();
        sendMessage();
    })

    // send attachment
    $('.attachment_input').change(function() {
        imagePreview(this, '.attachment_img_preview');
        $('.attachement_block').removeClass('d-none');
    })

    // cancel attachement
    $('.attachement_cancel-btn').on('click', function() {
        messageResetForm();
    })

    // message pagination
    actionOnScroll(".wsus__chat_area_body", function() {
        fetchMessages(getMessengerId());
    }, true)

});
