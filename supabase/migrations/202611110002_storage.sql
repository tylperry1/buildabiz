insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('business-documents','business-documents',false,10485760,array['application/pdf','image/jpeg','image/png']) on conflict(id) do nothing;
create policy business_document_read on storage.objects for select to authenticated using(bucket_id='business-documents' and public.can_read_business(((storage.foldername(name))[1])::uuid));
create policy business_document_insert on storage.objects for insert to authenticated with check(bucket_id='business-documents' and public.can_write_business(((storage.foldername(name))[1])::uuid));
create policy business_document_update on storage.objects for update to authenticated using(bucket_id='business-documents' and public.can_write_business(((storage.foldername(name))[1])::uuid)) with check(bucket_id='business-documents' and public.can_write_business(((storage.foldername(name))[1])::uuid));
create policy business_document_delete on storage.objects for delete to authenticated using(bucket_id='business-documents' and public.can_write_business(((storage.foldername(name))[1])::uuid));
