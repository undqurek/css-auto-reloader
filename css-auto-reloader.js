/**
 * Auto reloading tool for css.
 *
 * Made by undqurek@gmail.com
 *
 * License: MIT -> You can do with it what even u want
 */
( function()
{
    'use strict';

    // configuration

    var interval = 500; // scanning of changed files frequency
    var criterion = /^(https?:\/\/(localhost|127\.0\.0\.1)|(?!(https?:)?\/\/)).*$/i; // http://localhost, https://localhost, http://127.0.0.1, https://127.0.0.1 or relative path

    // variables

    var actions = [ ];

    // helper methods

    function checkLink( link )
    {
        return link.match( criterion );
    }

    function checkType( type )
    {
        if( typeof type == 'string' )
        {
            if( type == '' || type == 'stylesheet' )
                return true;

            return false;
        }

        return true;
    }

    function filterElements( elements )
    {
        var result = [ ];

        for ( var i = 0; i < elements.length; ++i )
        {
            var element = elements[ i ];

            var type = element.getAttribute( 'rel' );
            var link = element.getAttribute( 'href' );

            if( checkType( type ) && checkLink( link ) )
                result.push( element );
        }

        return result;
    }

    function findElements()
    {
        var elements = document.getElementsByTagName( 'link' );

        return filterElements( elements );
    }

    function executeFunction( action )
    {
        function onChange()
        {
            if ( document.readyState === 'complete' )
            {
                document.removeEventListener( 'readystatechange', onChange );

                action();
            }
        }

        document.addEventListener( 'readystatechange', onChange );
    }

    function collectAction( element )
    {
        var cache = document.createElement( 'link' );

        cache.setAttribute( 'rel', 'stylesheet' );
        cache.setAttribute( 'type', 'text/css' );

        var link = element.getAttribute( 'href' );

        var requester = new HeaderRequester( link, function()
        {
            cache.setAttribute( 'href', link + '?' + Math.random() );

            var parent = element.parentNode;

            if( parent )
            {
                parent.insertBefore( cache, element.nextSibling );

                var tmp = element;

                element = cache;
                cache = tmp;
            }
        } );

        actions.push( requester.request.bind( requester ) );
    }

    function collectActions()
    {
        var elements = findElements();

        for ( var i = 0; i < elements.length; ++i )
        {
            var element = elements[ i ];

            collectAction( element );
        }
    }

    function executeActions()
    {
        for ( var i = 0; i < actions.length; ++i )
        {
            var action = actions[ i ];

            action();
        }
    }

    // helper classes

    function HeaderRequester( link, action )
    {
        var cache = '';

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function()
        {
            if( xhr.readyState == 4 && xhr.status == 200 )
            {
                var time = xhr.getResponseHeader( 'Last-Modified' );

                if( cache == time )
                    return;

                action( cache = time );
            }
        };

        this.request = function()
        {
            xhr.open( 'HEAD', link + '?' + Math.random(), true );
            xhr.send();
        };
    }

    // execution

    executeFunction( function()
    {
        collectActions();

        setInterval( executeActions, interval );
    } );
} )();