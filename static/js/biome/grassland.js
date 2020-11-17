$('#test-silhouette').click(e => {
  api.catchCreature('grassland').then(creature => {
    notify({content: `caught ${creature.codename}!`, type: 'success'});
  }).catch(err => {
    notify({content: `api error: ${JSON.stringify(err)}!`, type: 'error'});
  });
});