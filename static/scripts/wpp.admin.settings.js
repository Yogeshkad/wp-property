/**
 * WP-Property Admin Settings page
 *
 */
jQuery.extend( wpp = wpp || {}, { ui: { settings: {

  /**
   * Initialize DOM.
   *
   * @for wpp.ui.settings
   * @method ready
   */
  ready: function() {

    if( typeof jQuery.fn.tooltip == 'function' ) {
      jQuery( document ).tooltip({
        track: true
      });
    }

    /**
     * Handles data saving.
     * Only if we don't upload backup file!
     *
     * @author peshkov@UD
     */
    jQuery( '#wpp_settings_form' ).submit( function() {
      if( !jQuery( '#wpp_backup_file' ).val() ) {
		var btn = jQuery( "input[type='submit']" );
		 jQuery("#wpp_inquiry_property_types tbody tr").each(function(){
			if(jQuery(".slug_setter",this).val() == ""){
			 jQuery(this).addClass('no-slug');
			} else{
			  jQuery(this).addClass('yes-slug');
			  btn.prop( 'disabled', false );
			}
		 });
	  if(jQuery("#wpp_inquiry_property_types tbody tr.yes-slug").length==0){
		jQuery('.wpp_save_changes_row').after('<div class="notice notice-error"><p>'+wpp.strings.error_types_one+'</p></div>');
		return false;
	  } else{
	   jQuery("table.last_delete_row tbody tr").each(function(){
	    if(jQuery(".slug_setter",this).val() == ""){
	     jQuery(this).remove();
	    }
	   });
        btn.prop( 'disabled', true );	
        var data = jQuery( this ).serialize();
        jQuery.ajax({
          type: 'POST',
          url: wpp.instance.ajax_url,
          data: {
            action: 'wpp_save_settings',
            data: data
          },
          success: function( response ){
            var data = jQuery.parseJSON( response );
            if( data.success ) {
              window.location.href = data.redirect;
            } else {
              alert( data.message );
              btn.prop( 'disabled', false );
            }
          },
          error: function() {
            alert( wpp.strings.undefined_error );
            btn.prop( 'disabled', false );
          }
        });
        return false;
      }
	  }
    } );

    /* Tabs for various UI elements */
    jQuery( '.wpp_subtle_tabs' ).tabs();

    wpp.ui.settings.setup_default_property_page();

    jQuery( "#wpp_settings_base_slug" ).change( function () {
      wpp.ui.settings.setup_default_property_page();
    } );

    if ( document.location.hash != '' && jQuery( document.location.hash ).length > 0 ) {
      jQuery( "#wpp_settings_tabs" ).tabs();
    } else {
      jQuery( "#wpp_settings_tabs" ).tabs( { cookie: {  name: 'wpp_settings_tabs', expires: 30 } } );
    }

    /* Show settings array */
    jQuery( "#wpp_show_settings_array" ).click( function () {
      var $this = jQuery(this),
          $showSettingsElem = jQuery( "#wpp_show_settings_array_result" ),
          $cancelBtn = jQuery( "#wpp_show_settings_array_cancel" ),
          loadedClass = 'wp_properties_loaded';

      if ($showSettingsElem.hasClass(loadedClass)) {
        $cancelBtn.show();
        $showSettingsElem.show();
      } else {
        $this.attr('disabled', 'disabled');
        jQuery.post( wpp.instance.ajax_url, {
          action: 'wpp_ajax_print_wp_properties'
        }, function ( data ) {

          $cancelBtn.show();
          $this.removeAttr('disabled');
          $showSettingsElem.text(data).addClass(loadedClass).show();
        } );
      }

    } );

    /* Hide settings array */
    jQuery( "#wpp_show_settings_array_cancel" ).click( function () {
      jQuery( "#wpp_show_settings_array_result" ).hide();
      jQuery( this ).hide();
    } );

    /* Hide property query */
    jQuery( "#wpp_ajax_property_query_cancel" ).click( function () {
      jQuery( "#wpp_ajax_property_result" ).hide();
      jQuery( this ).hide();
    } );

    /* Hide image query */
    jQuery( "#wpp_ajax_image_query_cancel" ).click( function () {
      jQuery( "#wpp_ajax_image_result" ).hide();
      jQuery( this ).hide();
    } );

    /* Clear Cache */
    jQuery( "#wpp_clear_cache" ).click( function () {
      jQuery( '.clear_cache_status' ).remove();
      jQuery.post( wpp.instance.ajax_url, {
        action: 'wpp_ajax_clear_cache'
      }, function ( data ) {
        message = "<div class='clear_cache_status updated fade'><p>" + data + "</p></div>";
        jQuery( message ).insertAfter( "h2" );
      } );
    } );

    /* Revalidate all addresses */
    jQuery( "#wpp_ajax_revalidate_all_addresses" ).click( function () {
      jQuery( this ).val( wpp.strings.processing );
      jQuery( this ).attr( 'disabled', true );
      jQuery( '.address_revalidation_status' ).remove();

      jQuery.post( wpp.instance.ajax_url, {
        action: 'wpp_ajax_revalidate_all_addresses'
      }, function ( data ) {
        jQuery( "#wpp_ajax_revalidate_all_addresses" ).val( 'Revalidate again' );
        jQuery( "#wpp_ajax_revalidate_all_addresses" ).attr( 'disabled', false );
        var message = '';
        if ( data.success == 'true' ) {
          message = "<div class='address_revalidation_status updated fade'><p>" + data.message + "</p></div>";
        } else {
          message = "<div class='address_revalidation_status error fade'><p>" + data.message + "</p></div>";
        }
        jQuery( message ).insertAfter( "h2" );
      }, 'json' );
    } );

    /* Show property query */
    jQuery( "#wpp_ajax_property_query" ).click( function () {
      var property_id = jQuery( "#wpp_property_class_id" ).val();
      jQuery( "#wpp_ajax_property_result" ).html( "" );

      jQuery.post( wpp.instance.ajax_url, {
        action: 'wpp_ajax_property_query',
        property_id: property_id
      }, function ( data ) {
        jQuery( "#wpp_ajax_property_result" ).show();
        jQuery( "#wpp_ajax_property_result" ).html( data );
        jQuery( "#wpp_ajax_property_query_cancel" ).show();
      } );
    } );

    //** Mass set property type */
    jQuery( "#wpp_ajax_max_set_property_type" ).click( function () {
      if ( !confirm( wpp.strings.set_property_type_confirmation ) ) {
        return;
      }
      jQuery.post( wpp.instance.ajax_url, {
        action: 'wpp_ajax_max_set_property_type',
        property_type: jQuery( "#wpp_ajax_max_set_property_type_type" ).val()
      }, function ( data ) {
        jQuery( "#wpp_ajax_max_set_property_type_result" ).show();
        jQuery( "#wpp_ajax_max_set_property_type_result" ).html( data );
      } );
    } );

    /* Show image data */
    jQuery( "#wpp_ajax_image_query" ).click( function () {
      var image_id = jQuery( "#wpp_image_id" ).val();
      jQuery( "#wpp_ajax_image_result" ).html( "" );

      jQuery.post( wpp.instance.ajax_url, {
        action: 'wpp_ajax_image_query',
        image_id: image_id
      }, function ( data ) {
        jQuery( "#wpp_ajax_image_result" ).show();
        jQuery( "#wpp_ajax_image_result" ).html( data );
        jQuery( "#wpp_ajax_image_query_cancel" ).show();
      } );
    } );

    /** Show property query */
    jQuery( "#wpp_check_premium_updates" ).click( function () {
      jQuery( "#wpp_plugins_ajax_response" ).hide();
      jQuery.post( wpp.instance.ajax_url, {
        action: 'wpp_ajax_check_plugin_updates'
      }, function ( data ) {
        jQuery( "#wpp_plugins_ajax_response" ).show();
        jQuery( "#wpp_plugins_ajax_response" ).html( data );
      } );
    } );


    jQuery( "#wpp_inquiry_attribute_fields tbody" ).sortable( {
      delay: 200
    } );

    jQuery( "#wpp_inquiry_meta_fields tbody" ).sortable( {
      delay: 200
    } );

    jQuery( "#wpp_inquiry_attribute_fields tbody tr, #wpp_inquiry_meta_fields tbody tr" ).live( "mouseover", function() {
      jQuery( this ).addClass( "wpp_draggable_handle_show" );
    } );
    ;

    jQuery( "#wpp_inquiry_attribute_fields tbody tr, #wpp_inquiry_meta_fields tbody tr" ).live( "mouseout", function() {
      jQuery( this ).removeClass( "wpp_draggable_handle_show" );
    } );
    ;

    /* Show advanced settings for an attribute when a certain value is changed */

    /*
     jQuery(".wpp_searchable_attr_fields").live("change", function() {
     var parent = jQuery(this).closest(".wpp_dynamic_table_row");
     jQuery(".wpp_development_advanced_option", parent).show();
     });
     */

    jQuery( ".wpp_all_advanced_settings" ).live( "click", function() {
      var action = jQuery( this ).attr( "action" );

      if( action == "expand" ) {
        jQuery( this ).parents( '.developer-panel' ).find( ".wpp_development_advanced_option" ).show();
      }

      if( action == "collapse" ) {
        jQuery( this ).parents( '.developer-panel' ).find( ".wpp_development_advanced_option" ).hide();
      }

    } );

    //* Stats to group functionality */
    jQuery( '.wpp_attribute_group' ).wppGroups();

    //* Fire Event after Row is added */
    jQuery( '#wpp_inquiry_attribute_fields tr' ).live( 'added', function() {
      //* Remove notice block if it exists */
      var notice = jQuery( this ).find( '.wpp_notice' );
      if( notice.length > 0 ) {
        notice.remove();
      }
      //* Unassign Group from just added Attribute */
      jQuery( 'input.wpp_group_slug', this ).val( '' );
      this.removeAttribute( 'wpp_attribute_group' );

      //* Remove background-color from the added row if it's set */
      if( typeof jQuery.browser.msie != 'undefined' && (parseInt( jQuery.browser.version ) == 9) ) {
        //* HACK FOR IE9 (it's just unset background color) peshkov@UD: */
        setTimeout( function() {
          var lr = jQuery( '#wpp_inquiry_attribute_fields tr.wpp_dynamic_table_row' ).last();
          var bc = lr.css( 'background-color' );
          lr.css( 'background-color', '' );
          jQuery( document ).bind( 'mousemove', function() {
            setTimeout( function() {
              lr.prev().css( 'background-color', bc );
            }, 50 );
            jQuery( document ).unbind( 'mousemove' );
          } );
        }, 50 );
      } else {
        jQuery( this ).css( 'background-color', '' );
      }

      //* Stat to group functionality */
      jQuery( this ).find( '.wpp_attribute_group' ).wppGroups();

    } );

    //* Determine if slug of property stat is the same as Geo Type has and show notice */
    jQuery( '#wpp_inquiry_attribute_fields tr .wpp_stats_slug_field' ).live( 'change', function() {
      var slug = jQuery( this ).val();
      var geo_type = false;
      if( typeof wpp.instance.settings.geo_type_attributes == 'object' ) {
        for( var i in wpp.instance.settings.geo_type_attributes ) {
          if( slug == wpp.instance.settings.geo_type_attributes[i] ) {
            geo_type = true;
            break;
          }
        }
      }
      var notice = jQuery( this ).parent().find( '.wpp_notice' );
      if( geo_type ) {
        if( !notice.length > 0 ) {
          //* Toggle Advanced option to show notice */
          var advanced_options = (jQuery( this ).parents( 'tr.wpp_dynamic_table_row' ).find( '.wpp_development_advanced_option' ));
          if( advanced_options.length > 0 ) {
            if( jQuery( advanced_options.get( 0 ) ).is( ':hidden' ) ) {
              jQuery( this ).parents( 'tr.wpp_dynamic_table_row' ).find( '.wpp_show_advanced' ).trigger( 'click' );
            }
          }
          jQuery( this ).parent().append( '<div class="wpp_notice"></div>' );
          notice = jQuery( this ).parent().find( '.wpp_notice' );
        }
        notice.html( '<span>' + wpp.strings.geo_attribute_usage + '</span>' );
      } else {
        if( notice.length > 0 ) {
          notice.remove();
        }
      }
    } );

    jQuery( ".wpp_pre_defined_value_setter" ).live( "change", function() {
      wpp.ui.settings.set_pre_defined_values_for_attribute( this );
    } );
    jQuery( ".wpp_pre_defined_value_setter" ).each( function() {
      wpp.ui.settings.set_pre_defined_values_for_attribute( this );
    } );
    // Assigning  default value
    jQuery( ".wpp_admin_input_col .wpp_pre_defined_value_setter" ).live( "change", function() {
      wpp.ui.settings.default_values_for_attribute( this );
    } );
    jQuery( ".wpp_admin_input_col .wpp_pre_defined_value_setter" ).each( function() {
      wpp.ui.settings.default_values_for_attribute( this );
    } );

    /**
     * Upload Image
     */
    jQuery('.button-setup-image').live( 'click', function(e) {
      e.preventDefault();
      var section = jQuery( this).parents( '.upload-image-section' );
      if( !section.length > 0 ) {
        return;
      }
      var image = wp.media({
        title: wpp.strings.default_property_image,
        multiple: false
      }).open()
        .on('select', function(e){
          // This will return the selected image from the Media Uploader, the result is an object
          var uploaded_image = image.state().get('selection').first();
          // We convert uploaded_image to a JSON object to make accessing it easier
          // Output to the console uploaded_image
          //console.log(uploaded_image);
          var image_url = uploaded_image.toJSON().url;
          var image_id = uploaded_image.toJSON().id;
          // Let's assign the url and id values to the input fields
          jQuery( 'input.input-image-url', section ).val(image_url);
          jQuery( 'input.input-image-id', section ).val(image_id);

          wpp.ui.settings.append_default_image( section );
        });
    });

    jQuery( '.upload-image-section' ).each( function( i, e ){
      wpp.ui.settings.append_default_image( jQuery(e) );
    } );

    jQuery( '#wpp_inquiry_property_types tr').live( 'added', function() {
      var section = jQuery( this).find( '.upload-image-section' );
      if( !section.length > 0 ) {
        return;
      }
      jQuery( 'input.input-image-url', section ).val('');
      jQuery( 'input.input-image-id', section ).val('');
      jQuery( '.image-wrapper img', section ).remove();
      jQuery( '.button-remove-image', section ).remove();
    } );

    /**
     * Default value.
     */
    jQuery(document).on('change', '.en_default_value:checkbox', function(){
      var _this = jQuery(this);
      if(this.checked)
        _this.closest('td').siblings('td.wpp_admin_input_col').find('.wpp_attribute_default_values').show();
      else
        _this.closest('td').siblings('td.wpp_admin_input_col').find('.wpp_attribute_default_values').hide();
    });
    
    jQuery(document).on('click', '.apply-to-all', function(){
      var $this = jQuery(this),
          attribute  = $this.data('attribute'),
          value = $this.parent().find('input, select, textarea').val(),
          data  = {
                    attribute: attribute,
                    value: value,

                };
      if($this.hasClass('disabled')) return false;
      $this.addClass('disabled').attr('disabled', 'disabled');
      jQuery.ajax({
          type: 'POST',
          url: wpp.instance.ajax_url,
          data: {
            action: 'wpp_apply_default_value',
            data: data
          },
          success: function( response ){
            var response = jQuery.parseJSON( response );
            if( response.status == 'success' ) {
              $this.removeClass('disabled').removeAttr('disabled');
              wppModal({
                    message: response.message,
                    title: wpp.strings._done
                });
            } else if(response.status == 'confirm' ) {
              wppModal({
                    message: response.message,
                    buttons: {
                        [wpp.strings.replace_all]: function () {
                            var _this = jQuery(this);
                            data.confirmed = 'all';
                            jQuery(this).parent().find('.ui-dialog-buttonpane button').addClass('disabled').attr('disabled', 'disabled');
                            onConfirm(data, function(){
                              $this.removeClass('disabled').removeAttr('disabled');
                            });
                        },
                        [wpp.strings.replace_empty]: function () {
                            var _this = jQuery(this);
                            data.confirmed = 'empty-or-not-exist';
                            jQuery(this).parent().find('.ui-dialog-buttonpane button').addClass('disabled').attr('disabled', 'disabled');
                            onConfirm(data, function(){
                              $this.removeClass('disabled').removeAttr('disabled');
                            });
                        },
                        [wpp.strings.cancel]: function () {
                            $this.removeClass('disabled').removeAttr('disabled');
                            jQuery(this).dialog("close");
                        }
                    },
                    close: function (event, ui) {
                        $this.removeClass('disabled').removeAttr('disabled');
                        jQuery(this).remove();
                    }
                });
            }
          },
          error: function() {
            $this.removeClass('disabled').removeAttr('disabled');
            alert( wpp.strings.undefined_error );
          }
        });
      return false;
    });

    var onConfirm = function(data, callback){
      if(typeof callback == 'undefined')
        callback = function(){}
      jQuery.ajax({
          type: 'POST',
          url: wpp.instance.ajax_url,
          data: {
            action: 'wpp_apply_default_value',
            data: data
          },
          success: function( response ){
            var response = jQuery.parseJSON( response );
            callback();
            wppModal({
                    message: response.message,
                    title: wpp.strings._done
                });
          },
          error: function() {
            callback();
            alert( wpp.strings.undefined_error );
          }
        });
    }
  },

  /**
   * Renders specified image in upload section
   */
  append_default_image: function( section ) {
    if(
      jQuery( '.image-wrapper', section ).length > 0 &&
      jQuery( 'input.input-image-url', section ).length > 0 &&
      jQuery( 'input.input-image-url', section ).val().length > 0
    ) {
      jQuery( '.image-wrapper', section ).html('')
        .append( '<img src="' + jQuery( 'input.input-image-url', section ).val() + '" alt="" title="" />' );
      wpp.ui.settings.append_remove_default_image_btn( section );
    }
  },

  /**
   * Renders 'Remove Image' button in upload section
   */
  append_remove_default_image_btn: function( section ) {
    if(
      jQuery( '.image-actions', section ).length > 0 &&
      !jQuery( '.button-remove-image', section ).length > 0
    ) {
      jQuery( '.image-actions', section ).append('<input class="button-secondary button-remove-image" type="button" value="' + wpp.strings.remove_image + '">');
      jQuery( '.button-remove-image', section ).one( 'click', function() {
        jQuery( 'input.input-image-url', section ).val('');
        jQuery( 'input.input-image-id', section ).val('');
        jQuery( '.image-wrapper img', section ).remove();
        jQuery(this).remove();
      } );
    }
  },

  /**
   *
   */
  set_pre_defined_values_for_attribute: function( setter_element ) {

    var wrapper = jQuery( setter_element ).closest( "ul" );
    var setting = jQuery( setter_element ).val();
    var value_field = jQuery( "textarea.wpp_attribute_pre_defined_values", wrapper );

    switch( setting ) {

      case 'dropdown':
      case 'advanced_range_dropdown':
      case 'select_advanced':
      case 'multi_checkbox':
      case 'radio':
        jQuery( value_field ).show();
        break;

      case 'input':
      case 'text':
      case 'range_input':
      case 'checkbox':
      default:
        jQuery( value_field ).hide();

    }

  },

  /**
   * @Author: Md. Alimuzzaman Alim
   */
  default_values_for_attribute: function( setter_element ) {

    var default_wrapper            = jQuery( setter_element ).closest( "ul" );
    var row_wrapper                = jQuery( setter_element ).closest( ".wpp_dynamic_table_row" );
    var setting                    = jQuery( setter_element ).val();
    var type                       = wpp.instance.settings.attributes.default[setting];
    var en_default_value_container = row_wrapper.find('.en_default_value_container');
    var en_default_value           = en_default_value_container.find('.en_default_value:checkbox');
    
    if(typeof(type) == "undefined"){
      default_wrapper.find('.wpp_attribute_default_values').hide();
      en_default_value.prop('checked', false).attr('disabled', 'disabled').addClass('disabled').trigger('change');
      en_default_value_container.attr('title', wpp.strings.attr_not_support_default ).addClass('overlay');
    }
    else{
      var dvc = default_wrapper.find('.default_value_container');
      dvc.html('');
      if(type == 'text'){
        jQuery("<input />" )
          .addClass('type-text type-url rwmb-text')
          .attr('name', dvc.attr('data-name'))
          .attr('value', dvc.attr('data-value')).appendTo(dvc);
      }
      else if(type == 'textarea'){
        jQuery("<textarea />" )
          .addClass('type-text type-url rwmb-textarea')
          .attr('name', dvc.attr('data-name'))
          .html(dvc.attr('data-value')).appendTo(dvc);
      }
      en_default_value.removeAttr('disabled').removeAttr('title').removeClass('disabled').trigger('change');
      en_default_value_container.removeAttr('title').removeClass('overlay');
    }
  },

  /**
   * Modifies UI to reflect Default Property Page selection
   *
   * @for wpp.ui.settings
   * @method setup_default_property_page
   */
  setup_default_property_page: function() {
    var selection = jQuery( "#wpp_settings_base_slug" ).val();
    /* Default Property Page is dynamic. */
    if ( selection == "property" ) {
      jQuery( ".wpp_non_property_page_settings" ).hide();
      jQuery( ".wpp_non_property_page_settings input[type=checkbox]" ).attr( "checked", false );
      jQuery( ".wpp_non_property_page_settings input[type=checkbox]" ).attr( "disabled", true );
    } else {
      jQuery( ".wpp_non_property_page_settings" ).show();
      jQuery( ".wpp_non_property_page_settings input[type=checkbox]" ).attr( "disabled", false );
    }
  }

}}});

// Initialize Overview.
jQuery( document ).ready( wpp.ui.settings.ready );

wppModal = function(option){
  var _default = {
    modal: true,
    title: wpp.strings.are_you_sure,
    zIndex: 10000,
    autoOpen: true,
    width: 'auto',
    resizable: false,
    buttons: {
        [wpp.strings.cancel]: function () {
            jQuery(this).dialog("close");
        }
    },
    close: function (event, ui) {
        jQuery(this).remove();
    }
  };
  option = jQuery.extend(true, {}, _default, option);

  var wppModalBox = jQuery('#wpp-modal');
  if(wppModalBox.length == 0)
    wppModalBox = jQuery('<div id="wpp-modal"></div>').appendTo('body')
                .html('<div><h3 class="message"></h3></div>');
  wppModalBox.find('h3.message').html(option.message);
  wppModalBox.dialog(option);
  return wppModalBox.dialog( "instance" );
}
