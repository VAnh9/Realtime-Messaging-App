<?php

/** calculate time message send */
if (!function_exists('timeAgo')) {
    function timeAgo($time) {
        $timeDiff = time() - strtotime($time);

        if ($timeDiff <= 60) {
            $result = ($timeDiff <= 1) ? 'a second ago' : $timeDiff . 's ago';
        } elseif ($timeDiff <= 3600) {
            $minutes = round($timeDiff / 60);
            $result = $minutes . 'm ago';
        } elseif ($timeDiff <= 86400) {
            $hours = round($timeDiff / 3600);
            $result = $hours . 'h ago';
        } else {
            $result = date('j M y', strtotime($time));
        }

        return $result;
    }

}
