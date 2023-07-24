document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    var form = e.target;
    var formData = new FormData(form);
  
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/generate-pdf');
    xhr.responseType = 'blob';
   
    xhr.onload = function() {
      if (xhr.status === 200) {
        var blob = new Blob([xhr.response], { type: 'application/pdf' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'output.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        console.error('Une erreur lors de la génération du PDF!!');
      }
    };
  
    xhr.send(formData);
  });
  