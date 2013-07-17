importPackage(com.sencha.tools.compiler.jsb.statements);

var _logger = SenchaLogManager.getLogger("kickbak-build");

(function(Scope)
{
   Scope.stripSpecialDirNames = function(path)
   {
      var cleanPath = path + '';
     
      if (cleanPath.match(/\.\.\/lib\//g))
      {
         return cleanPath;
      }
      else
      {
         cleanPath = cleanPath.replace(/\.\.\\/g, "").replace(/\.\.\/mobile\//g, "").replace(/\.\.\//g, "").replace(/\.\\/g, "").replace(/\.\//g, "").replace(/\~\//g, "");
      }
      //_logger.info("KickBak Build CleanPath=" + cleanPath);
      return cleanPath;
   };

   Scope.copy = function(src, dest, filter)
   {
      dest = (dest + "").replace(/\.\.\/mobile\//g, "/");
      PathUtil.ensurePathExists(dest);
      _logger.debug("copying {} to {}", src, dest);
      if (filter)
      {
         FileUtil.copy(src, dest, filter);
      }
      else
      {
         FileUtil.copy(src, dest);
      }
   };
})(this);

_logger.info("KickBak Build loaded");
