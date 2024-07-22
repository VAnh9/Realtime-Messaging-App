@extends('messenger.layouts.master')
@section('content')

<section class="wsus__chat_app show_info">

    @include('messenger.layouts.user-list-sidebar')

    @include('messenger.layouts.chat-area')

    @include('messenger.layouts.chat-info-sidebar')

</section>
@endsection
