<?php

/** calculate time message send */
if (!function_exists('timeAgo')) {
    function timeAgo($time) {
        $timeDiff = time() - strtotime($time);
        $seconds = $timeDiff;
        $minutes = round($timeDiff / 60);
        $hours = round($timeDiff / 3600);

        if($seconds <= 60) {
            if($seconds <= 1) {
                return 'a seconds ago';
            }
            return $seconds.'s ago';
        } else if ($minutes <= 60) {
            return $minutes.'m ago';
        } else if ($hours <= 24) {
            return $hours.'h ago';
        } else {
            return date('j M y', strtotime($time));
        }
    }
}
