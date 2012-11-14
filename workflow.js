var wf = (function() {

    var WorkflowAction = function() {   
        this.result = null;
        this.invoked = function(){};
        this.invoke = function(){
            this.invoked();
        };
    }
    
    var executeWorkflow = function(workflow, doneCb, errCb)
    {
        // Omitted error callback
        if (arguments.length < 3)
            errCb = function(err){throw err;};
        
        // Omitted done callback
        if (arguments.length < 2)
            doneCb = function(){};
        
        try {
            var currentAction = workflow.next();
            currentAction.invoked = function() {
                // ensure action is only invoked once
                currentAction.invoked = function(){};
                executeWorkflow(workflow, doneCb, errCb);
            };
            currentAction.invoke();
        }
        catch(err if err instanceof StopIteration){
            doneCb();
        }
        catch(err2) {
            errCb(err2);
        }
    }
    
    var pause = function(waitTime) {
        var w = new WorkflowAction();
        w.invoke = function() {
            setTimeout(function() {
                w.invoked();
            }, waitTime);
        };
        return w;
    }
    
    return {
        "WorkflowAction": WorkflowAction,
        "executeWorkflow": executeWorkflow,
        "pause": pause
    };
})();

if (typeof(jQuery) != "undefined")
{
	(function( $ ){

		var methods = {

			event: function(eventType) {
				var w = new wf.WorkflowAction();
				var jq = this;
				w.invoke = function() {
					jq.each(function() {
						$(this).bind(eventType, function(e) {
							w.result = e;
							w.invoked();
						});
					});
				};
				return w;
			},

			ajax: function(url, settings) {
				var w = new wf.WorkflowAction();
				settings.succeeded = function(data) {
					w.result = data;
					w.invoked();
				};
				w.invoke = function() {
					$.ajax(url, settings)
				};
				return w;
			},
			
			pause: function(waitTime) {
				return wf.pause(waitTime);
			}
		};

		$.fn.workflow = function( method ) {
	  
			// Method calling logic
			if ( methods[method] ) {
				return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
			} else if ( typeof method === 'object' || ! method ) {
				return methods.init.apply( this, arguments );
			} else {
				$.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
		}
	  
	};

	})( jQuery );
}