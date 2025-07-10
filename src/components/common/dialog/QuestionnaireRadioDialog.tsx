// import { Button } from '@/components/ui/button'
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
// import { QASSMode } from '@/config/app'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { useEffect, useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { z } from 'zod'

// interface QuestionnaireDialogProps {
//   triggerButton: React.ReactNode
// }

// const formSchema = z.object({
//   peerRatingImpact: z.coerce.number().min(0),
//   mode: z.string(),
//   isSelfRating: z.coerce.boolean(),
// })

// const peerRatingImpactOptions = [
//   {
//     value: 0,
//     name: 'Not at all',
//   },
//   {
//     value: 0.5,
//     name: 'A little',
//   },
//   {
//     value: 1,
//     name: 'Moderately',
//   },
//   {
//     value: 1.5,
//     name: 'A lot',
//   },
// ]

// const groupSpreadOptions = [
//   {
//     value: 0.9,
//     name: 'Very similar',
//   },
//   {
//     value: 0.5,
//     name: 'Balanced',
//   },
//   {
//     value: 0.1,
//     name: 'Very different',
//   },
// ]

// const qassModeOptions = [
//   {
//     value: 'B',
//     name: QASSMode.B,
//   },
//   {
//     value: 'C',
//     name: QASSMode.C,
//   },
//   {
//     value: 'D',
//     name: QASSMode.D,
//   },
// ]

// const selfRatingOptions = [
//   {
//     value: true,
//     name: 'Yes',
//   },
//   {
//     value: false,
//     name: 'No',
//   },
// ]

// const QuestionnaireDialog = ({ triggerButton }: QuestionnaireDialogProps) => {
//   const [open, setOpen] = useState(false)
//   const defaultValues = {
//     peerRatingImpact: undefined,
//     groupSpread: undefined,
//     mode: undefined,
//     isSelfRating: undefined,
//   }
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues,
//   })

//   const onSubmit = async (values: z.infer<typeof formSchema>) => {
//     console.log('TLOG ~ values:', values)
//   }

//   useEffect(() => {
//     if (open) form.reset(defaultValues)
//   }, [open, form])

//   return (
//     <Dialog
//       open={open}
//       onOpenChange={setOpen}
//     >
//       <DialogTrigger asChild>
//         <div
//           className="flex justify-end"
//           onClick={() => setOpen(true)}
//         >
//           {triggerButton}
//         </div>
//       </DialogTrigger>
//       <DialogContent>
//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(onSubmit)}
//             className="space-y-4"
//           >
//             <DialogHeader>
//               <DialogTitle className="text-2xl">Questionnaire for model configuration</DialogTitle>
//             </DialogHeader>

//             <div className="grid w-full items-center gap-4">
//               <FormField
//                 control={form.control}
//                 name="peerRatingImpact"
//                 render={({ field }) => (
//                   <FormItem className="space-y-3">
//                     <FormLabel>1. How much should peer ratings influence individual scores?</FormLabel>
//                     <FormControl>
//                       <RadioGroup
//                         onValueChange={(val) => field.onChange(Number(val))}
//                         value={field.value?.toString() ?? ''}
//                         className="flex flex-col"
//                       >
//                         {peerRatingImpactOptions.map((opt, i) => (
//                           <FormItem
//                             key={i}
//                             className="flex items-center gap-3"
//                           >
//                             <FormControl>
//                               <RadioGroupItem value={opt.value?.toString()} />
//                             </FormControl>
//                             <FormLabel className="font-normal">{opt.name}</FormLabel>
//                           </FormItem>
//                         ))}
//                       </RadioGroup>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="groupSpread"
//                 render={({ field }) => (
//                   <FormItem className="space-y-3">
//                     <FormLabel>2. How much should individual scores differ based on peer ratings?</FormLabel>
//                     <FormControl>
//                       <RadioGroup
//                         onValueChange={(val) => field.onChange(Number(val))}
//                         value={field.value?.toString() ?? ''}
//                         className="flex flex-col"
//                       >
//                         {groupSpreadOptions.map((opt, i) => (
//                           <FormItem
//                             key={i}
//                             className="flex items-center gap-3"
//                           >
//                             <FormControl>
//                               <RadioGroupItem value={opt.value?.toString()} />
//                             </FormControl>
//                             <FormLabel className="font-normal">{opt.name}</FormLabel>
//                           </FormItem>
//                         ))}
//                       </RadioGroup>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="mode"
//                 render={({ field }) => (
//                   <FormItem className="space-y-3">
//                     <FormLabel>3. What kind of scoring behaviour do you prefer?</FormLabel>
//                     <FormControl>
//                       <RadioGroup
//                         onValueChange={field.onChange}
//                         value={field.value ?? ''}
//                         className="flex flex-col"
//                       >
//                         {qassModeOptions.map((opt, i) => (
//                           <FormItem
//                             key={i}
//                             className="flex items-center gap-3"
//                           >
//                             <FormControl>
//                               <RadioGroupItem value={opt.value} />
//                             </FormControl>
//                             <FormLabel className="font-normal">{opt.name}</FormLabel>
//                           </FormItem>
//                         ))}
//                       </RadioGroup>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="isSelfRating"
//                 render={({ field }) => (
//                   <FormItem className="space-y-3">
//                     <FormLabel>4. Should students be allowed to rate themselves?</FormLabel>
//                     <FormControl>
//                       <RadioGroup
//                         onValueChange={(val) => field.onChange(val === 'true')}
//                         value={field.value?.toString() ?? ''}
//                         className="flex flex-col"
//                       >
//                         {selfRatingOptions.map((opt, i) => (
//                           <FormItem
//                             key={i}
//                             className="flex items-center gap-3"
//                           >
//                             <FormControl>
//                               <RadioGroupItem value={opt.value?.toString()} />
//                             </FormControl>
//                             <FormLabel className="font-normal">{opt.name}</FormLabel>
//                           </FormItem>
//                         ))}
//                       </RadioGroup>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* {data && (
//                 <FormField
//                   control={form.control}
//                   name="isActive"
//                   render={({ field }) => (
//                     <FormItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border p-4">
//                       <div className="space-y-0.5">
//                         <FormLabel className="text-base">Active</FormLabel>
//                         <FormDescription>Enable this classroom for student access.</FormDescription>
//                       </div>
//                       <FormControl>
//                         <Switch
//                           checked={field.value ?? false}
//                           onCheckedChange={field.onChange}
//                         />
//                       </FormControl>
//                     </FormItem>
//                   )}
//                 />
//               )} */}
//             </div>

//             <DialogFooter>
//               <Button
//                 variant="outline"
//                 type="button"
//                 onClick={() => setOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 // loading={createMutation.isPending || updateMutation.isPending}
//               >
//                 Apply
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   )
// }

// export default QuestionnaireDialog
