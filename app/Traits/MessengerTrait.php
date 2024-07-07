<?php

namespace App\Traits;

trait MessengerTrait {
    /** Time calculating */
    function timeAgo($time) {
        $timeDiff = time() - strtotime($time);
        $seconds = $timeDiff;
        $minutes = round($timeDiff / 60);
        $hours = round($timeDiff / 3600);
        $days = round($timeDiff / 86400);

        if($seconds <= 60) {
            return "$seconds\s ago";
        } else if ($minutes <= 60) {
            return "$minutes\m ago";
        } else if ($hours <= 24) {
            return "$hours\h ago";
        } else {
            return date('j M y', strtotime($days));
        }
    }
}
