/**
 * Auto reloading tool for css.
 *
 * Made by undqurek@gmail.com
 *
 * License: MIT -> You can do with it whatever you want
 */
( function()
{
    'use strict';

    if( window.__css_auto_reloader_c4dbca1428f9e7af886e636fabcaf845__ )
        return;

    window.__css_auto_reloader_c4dbca1428f9e7af886e636fabcaf845__ = true;

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
        var selection = element;

        var link = element.getAttribute( 'href' );

        var requester = new HeaderRequester( link, function()
        {
            var element = document.createElement( 'link' );

            element.setAttribute( 'rel', 'stylesheet' );
            element.setAttribute( 'href', link + '?' + Math.random() );

            element.addEventListener( 'load', function()
            {
                var parent = selection.parentNode;

                if( parent )
                {
                    parent.removeChild( selection );

                    selection = element;
                }
            } );

            var parent = selection.parentNode;

            if( parent )
                parent.insertBefore( element, selection.nextSibling );
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
        var cache = null;

        var xhr = new XMLHttpRequest();

        xhr.addEventListener( 'readystatechange', function()
        {
            if( xhr.readyState == 4 && xhr.status == 200 )
            {
                var time = xhr.getResponseHeader( 'Last-Modified' );

                if( cache )
                {
                    if( cache == time )
                        return;

                    action();
                }

                cache = time;
            }
        } );

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
