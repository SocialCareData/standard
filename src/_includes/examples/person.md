<div class="example">
  <h5 id="example-person">Example - Person (top level)</h5>
{% highlight json %}
{
  "@context": "https://socialcaredata.github.io/ontology/person/context.jsonld",
  "@id": "ex:person-9434765919",
  "@type": "Person",
  "identifiers":      [ { "see Identifier example" } ],
  "names":            [ { "see Name example" } ],
  "dateOfBirth":      { "see DateOfBirth example" },
  "addresses":        [ { "see Address example" } ],
  "gender":           "2",
  "sexCode":          "2",
  "ethnicCode":       "17",
  "deceased":         { "see Deceased example" },
  "relatedPeople":    [ { "see PersonRelationship example" } ],
  "matchedPersonRef": [
    { "@type": "Identifier", "value": "EDU-987654", "system": "https://example.org/Id/lea-code" }
  ],
  "statuses":         [ { "see Status example" } ]
}
{% endhighlight %}
</div>
